import {AsyncMqttClient, connectAsync} from 'async-mqtt';
import {Chance} from 'chance';
import {closeSync, openSync, unlinkSync} from 'fs';
import {Server} from 'mosca';

import {createServerAsync} from './utils/moscaHelper';

import Mqtt from '../src/types/Mqtt';

import {start, stop} from '../src';

const chance = new Chance();

describe('index', () => {
    const optionsFilePath = `${__dirname}/options.json`;
    const mqtt = {
        host: 'localhost',
        password: chance.string(),
        port: chance.natural({
            max: 9999,
            min: 1000,
        }),
        username: chance.string(),
    };

    let server: Server,
        client: AsyncMqttClient;

    beforeEach(async (done: () => void) => {
        server = await createServerAsync(mqtt);
        const {host, username, password, port}: Mqtt = mqtt;
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

    it('should', async (done: () => void) => {
        const vent = {
            closePayload: chance.string(),
            closedState: chance.string(),
            commandTopic: chance.string(),
            name: chance.string(),
            openPayload: chance.string(),
            openedState: chance.string(),
            stateTopic: chance.string(),
        };
        const room = {
            actualTemperatureStateTopic: chance.string(),
            name: chance.string(),
            targetTemperatureCommandTopic: chance.string(),
            targetTemperatureStateTopic: chance.string(),
            vents: [vent],
        };
        const thermostat = {
            actualTemperatureStateTopic: chance.string(),
            name: chance.string(),
            targetTemperatureCommandTopic: chance.string(),
            targetTemperatureStateTopic: chance.string(),
        };

        await start({
            configuration: {
                rooms: [room],
                thermostat,
            },
            log: false,
            mqtt,
        });

        client.on('message', (topic: string, message: string) => {
            //should get a message that thermostat.targetTemperatureCommandTopic became '73'
            //should get a message that vent.commandTopic become 'open'
            console.log('topic: ', topic, ' message: ', message);
            done();
        });
        await client.publish(thermostat.actualTemperatureStateTopic, '72');
        await client.publish(thermostat.targetTemperatureStateTopic, '72');
        await client.publish(room.actualTemperatureStateTopic, '72');
        await client.publish(room.targetTemperatureCommandTopic, '73');
    });
});
