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

    [
        {
            payload: '73',
            topic: thermostat.targetTemperatureCommandTopic,
        },
        {
            payload: vent.openPositionPayload,
            topic: vent.positionCommandTopic,
        },
    ].forEach((expected: {payload: string, topic: string}) => {
        it('should turn on heat and open vent if room is too cold', async (done: () => void) => {
            await client.subscribe(expected.topic);

            await start({
                house,
                log: false,
                mqttConnection,
            });

            client.on('message', (topic: string, payloadBuffer: Buffer) => {
                expect(topic).toBe(expected.topic);
                expect(payloadBuffer.toString()).toBe(expected.payload);
                done();
            });
            await client.publish(thermostat.modeStateTopic, thermostat.heatModePayload);
            await client.publish(thermostat.actualTemperatureStateTopic, '72');
            await client.publish(thermostat.targetTemperatureStateTopic, '72');
            await client.publish(room.actualTemperatureStateTopic, '72');
            await client.publish(room.targetTemperatureStateTopic, '73');
        });
    });

    [
        {
            payload: '72',
            topic: thermostat.targetTemperatureCommandTopic,
        },
        {
            payload: vent.closePositionPayload,
            topic: vent.positionCommandTopic,
        },
    ].forEach((expected: {payload: string, topic: string}) => {
        it('should turn off heat and close vent if room is target temperature', async (done: () => void) => {
            await client.subscribe(expected.topic);

            await start({
                house,
                log: false,
                mqttConnection,
            });

            client.on('message', (topic: string, payloadBuffer: Buffer) => {
                expect(topic).toBe(expected.topic);
                expect(payloadBuffer.toString()).toBe(expected.payload);
                done();
            });
            await client.publish(thermostat.modeStateTopic, thermostat.heatModePayload);
            await client.publish(thermostat.actualTemperatureStateTopic, '72');
            await client.publish(thermostat.targetTemperatureStateTopic, '73');
            await client.publish(room.actualTemperatureStateTopic, '73');
            await client.publish(room.targetTemperatureStateTopic, '73');
        });
    });
});
