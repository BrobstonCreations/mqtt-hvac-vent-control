import {Server} from 'aedes-server-factory';

import {createServerAsync} from './utils/moscaHelper';

import {AsyncMqttClient, connectAsync} from 'async-mqtt';
import {Chance} from 'chance';
import {closeSync, openSync, unlinkSync} from 'fs';

import {OPEN} from '../src/constants/Vent';
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

    const vent = {
        closePayload: chance.word(),
        closedState: chance.word(),
        name: chance.word(),
        openPayload: chance.word(),
        openedState: chance.word(),
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
            expectedPayload: OPEN.toString(),
            expectedTopic: vent.positionCommandTopic,
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
                mqttConnection,
            });

            client.on('message', (topic: string, payloadBuffer: Buffer) => {
                expect(topic).toBe(expectedTopic);
                expect(payloadBuffer.toString()).toBe(expectedPayload);
                done();
            });
            await client.publish(thermostat.actualTemperatureStateTopic, '72');
            await client.publish(thermostat.targetTemperatureStateTopic, '72');
            await client.publish(room.actualTemperatureStateTopic, '72');
            await client.publish(room.targetTemperatureStateTopic, '73');
        });
    });
});
