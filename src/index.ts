import {AsyncMqttClient, connect} from 'async-mqtt';

import {SYSTEM_NAME} from '../src/constants/system';
import {setupLogging} from './services/logService';
import {getOptionsFromEnvironmentOrFile} from './services/optionService';
import {adjustSystem} from './services/systemService';
import {adjustThermostat} from './services/thermostatService';
import {getAllStateTopicsFromObject} from './services/topicService';
import {adjustVents} from './services/ventService';
import Options from './types/Options';

let client: AsyncMqttClient;
let messages: {[key: string]: string|number} = {};

export const start = async (
    options: Options = getOptionsFromEnvironmentOrFile(),
): Promise<void> => {
    const {
        house,
        log,
        mqttConnection: {
            host,
            password,
            port,
            username,
        },
    }: Options = options;
    client = connect(`tcp://${host}:${port}`, {username, password});
    if (log) {
        setupLogging(client);
    }
    const allTopics = [
        ...getAllStateTopicsFromObject(house),
        `cmd/${SYSTEM_NAME}/pause`,
    ];
    await client.subscribe(allTopics);
    client.on('message', async (topic: string, payloadBuffer: Buffer)  => {
        const payload = payloadBuffer.toString();
        messages[topic] = payload;
        if (log) {
            console.log(JSON.stringify(messages, null, 2));
        }
        await adjustVents(house, messages, client);
        await adjustThermostat(house, messages, client);
        await adjustSystem(topic, payload, client);
    });
};

export const stop = async (): Promise<void> => {
    messages = {};
    await client.end();
};
