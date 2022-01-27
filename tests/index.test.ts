import {Server} from 'aedes-server-factory';

import {createServerAsync} from './utils/moscaHelper';

import {AsyncMqttClient, connectAsync} from 'async-mqtt';
import {Chance} from 'chance';
import {closeSync, openSync, unlinkSync} from 'fs';

import {MqttConnection} from '../src/types/Mqtt';

import {start, stop} from '../src';

const chance = new Chance();

describe('index', () => {
    const optionsFilePath = `${__dirname}/options.json`;
    const mqttConnection = {
        host: 'localhost',
        password: chance.string(),
        port: 1883,
        username: chance.string(),
    };
    const vent = {
        closePositionPayload: chance.word(),
        closedStatePayload: chance.word(),
        name: chance.word(),
        openPositionPayload: chance.word(),
        openedStatePayload: chance.word(),
        positionCommandTopic: chance.word(),
        positionStateTopic: chance.word(),
    };
    const room = {
        actualTemperatureStateTopic: chance.word(),
        name: chance.word(),
        targetTemperatureCommandTopic: chance.word(),
        targetTemperatureStateTopic: chance.word(),
        vents: [vent],
    };
    const thermostat = {
        actualTemperatureStateTopic: chance.word(),
        coolModePayload: chance.word(),
        heatModePayload: chance.word(),
        modeStateTopic: chance.word(),
        name: chance.word(),
        targetTemperatureCommandTopic: chance.word(),
        targetTemperatureStateTopic: chance.word(),
    };
    const house = {
        rooms: [room],
        thermostat,
    };

    let server: Server,
        client: AsyncMqttClient;

    beforeEach(async (done: () => void) => {
        server = await createServerAsync(mqttConnection);
        const {host, username, password, port}: MqttConnection = mqttConnection;
        client = await connectAsync(`tcp://${host}:${port}`, {username, password});
        closeSync(openSync(optionsFilePath, 'w'));
        done();
    });

    afterEach(async (done: () => void) => {
        unlinkSync(optionsFilePath);
        await client.end();
        server.close();
        process.env.OPTIONS = undefined;
        await stop();
        done();
    });

    it('should open vent if heat mode and actual room temperature is less than target room temperature',
        async (done: () => void) => {
        await client.subscribe(vent.positionCommandTopic);
        client.on('message', (topic: string, payloadBuffer: Buffer) => {
            expect(topic).toBe(vent.positionCommandTopic);
            expect(payloadBuffer.toString()).toBe(vent.openPositionPayload);
            done();
        });

        await start({
            house,
            log: false,
            mqttConnection,
        });

        await client.publish(thermostat.modeStateTopic, thermostat.heatModePayload);
        const actualTemperature = chance.natural();
        const targetTemperature = actualTemperature + 1;
        await client.publish(room.actualTemperatureStateTopic, actualTemperature.toString());
        await client.publish(room.targetTemperatureStateTopic, targetTemperature.toString());
    });

    it('should close vent if actual room temperature is less than target room temperature',
        async (done: () => void) => {
            await client.subscribe(vent.positionCommandTopic);
            client.on('message', (topic: string, payloadBuffer: Buffer) => {
                expect(topic).toBe(vent.positionCommandTopic);
                expect(payloadBuffer.toString()).toBe(vent.closePositionPayload);
                done();
            });

            await start({
                house,
                log: false,
                mqttConnection,
            });

            const temperature = chance.natural().toString();
            await client.publish(room.actualTemperatureStateTopic, temperature);
            await client.publish(room.targetTemperatureStateTopic, temperature);
        });
});
