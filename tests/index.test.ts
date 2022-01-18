import {Server} from 'aedes-server-factory';

import {createServerAsync} from './utils/moscaHelper';

import {AsyncMqttClient, connectAsync} from 'async-mqtt';
import {Chance} from 'chance';
import {closeSync, openSync, unlinkSync} from 'fs';

import Mqtt from '../src/types/Mqtt';

import {start, stop} from '../src';

const chance = new Chance();

describe('index', () => {
    const optionsFilePath = `${__dirname}/options.json`;
    const mqtt = {
        host: 'localhost',
        password: chance.string({alpha: true}),
        port: 1883,
        username: chance.string({alpha: true}),
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
            closePayload: chance.string({alpha: true}),
            closedState: chance.string({alpha: true}),
            commandTopic: chance.string({alpha: true}),
            name: chance.string({alpha: true}),
            openPayload: chance.string({alpha: true}),
            openedState: chance.string({alpha: true}),
            stateTopic: chance.string({alpha: true}),
        };
        const room = {
            actualTemperatureStateTopic: chance.string({alpha: true}),
            name: chance.string({alpha: true}),
            targetTemperatureCommandTopic: chance.string({alpha: true}),
            targetTemperatureStateTopic: chance.string({alpha: true}),
            vents: [vent],
        };
        const thermostat = {
            actualTemperatureStateTopic: chance.string({alpha: true}),
            name: chance.string({alpha: true}),
            targetTemperatureCommandTopic: chance.string({alpha: true}),
            targetTemperatureStateTopic: chance.string({alpha: true}),
        };

        await start({
            configuration: {
                rooms: [room],
                thermostat,
            },
            log: false,
            mqtt,
        });

        // client.on('message', (topic: string, message: string) => {
        //     //should get a message that thermostat.targetTemperatureCommandTopic became '73'
        //     //should get a message that vent.commandTopic become 'open'
        //     console.log('topic: ', topic, ' message: ', message);
        //     done();
        // });
        await client.publish(thermostat.actualTemperatureStateTopic, '72');
        await client.publish(thermostat.targetTemperatureStateTopic, '72');
        await client.publish(room.actualTemperatureStateTopic, '72');
        await client.publish(room.targetTemperatureCommandTopic, '73');
        done();
    });
});
