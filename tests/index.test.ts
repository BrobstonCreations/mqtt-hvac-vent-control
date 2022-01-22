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
    const mqtt = {
        host: 'localhost',
        password: chance.string(),
        port: 1883,
        username: chance.string(),
    };

    let server: Server,
        client: AsyncMqttClient;

    beforeEach(async (done: () => void) => {
        server = await createServerAsync(mqtt);
        const {host, username, password, port}: MqttConnection = mqtt;
        client = await connectAsync(`tcp://${host}:${port}`, {username, password});
        closeSync(openSync(optionsFilePath, 'w'));
        done();
    });

    afterEach(async (done: () => void) => {
        await stop();
        unlinkSync(optionsFilePath);
        await client.end();
        server.close();
        process.env.OPTIONS = undefined;
        done();
    });

    const vent = {
        closePayload: chance.word(),
        closedState: chance.word(),
        commandTopic: chance.word(),
        name: chance.word(),
        openPayload: chance.word(),
        openedState: chance.word(),
        stateTopic: chance.word(),
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
        name: chance.word(),
        targetTemperatureCommandTopic: chance.word(),
        targetTemperatureStateTopic: chance.word(),
    };
    const house = {
        rooms: [room],
        thermostat,
    };

    [
        {
            expectedPayload: '73',
            expectedTopic: thermostat.targetTemperatureCommandTopic,
        },
        {
            expectedPayload: 'open',
            expectedTopic: vent.commandTopic,
        },
    ].forEach(({
        expectedTopic,
        expectedPayload,
    }) => {
        it('should open vent if room is too cold', async (done: () => void) => {
            await client.subscribe(expectedTopic);

            await start({
                house,
                log: false,
                mqtt,
            });

            client.on('message', (topic: string, payloadBuffer: Buffer) => {
                expect(topic).toBe(expectedTopic);
                expect(payloadBuffer.toString()).toBe(expectedPayload);
                done();
            });
            await client.publish(thermostat.actualTemperatureStateTopic, '72');
            await client.publish(thermostat.targetTemperatureStateTopic, '72');
            await client.publish(room.actualTemperatureStateTopic, '72');
            await client.publish(room.targetTemperatureCommandTopic, '73');
        });
    });
});
