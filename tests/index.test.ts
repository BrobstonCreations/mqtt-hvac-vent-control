import {AsyncMqttClient, connectAsync} from 'async-mqtt';
import {Chance} from 'chance';
import {closeSync, openSync, unlinkSync, writeFileSync} from 'fs';
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
        const currentRoomTemperature = 71;
        const targetRoomTemperature = 72;
        const expectedTopic = `vent/living_room_east`;
        const expectedMessage = 'open';
        const options = {
            config: {
                rooms: [
                    {
                        name: 'Living Room',
                        target_command_topic: '',
                        temperature_state_topic: '',
                        vents: [
                            {
                                closeMessage: 'close',
                                name: 'East Vent',
                                openMessage: expectedMessage,
                                topic: expectedTopic,
                            },
                        ],
                    },
                ],
            },
            log: true,
            mqtt,
        };

        await start(options);

        client.on('message', (topic: string, message: string) => {
            expect(topic).toBe(expectedTopic);
            expect(message.toString()).toBe(expectedMessage);
            done();
        });
        await client.publish(expectedTopic, expectedMessage);
    });
});
