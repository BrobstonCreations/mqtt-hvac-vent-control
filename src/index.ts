import {AsyncMqttClient, connect} from 'async-mqtt';

import {setupLogging} from './services/logService';
import {getOptionsFromEnvironmentOrFile} from './services/optionService';
import {getState, initializeState, updateState} from './services/stateService';
import {adjustThermostat} from './services/thermostatService';
import {getAllStateTopicsFromObject} from './services/topicService';
import {adjustVents} from './services/ventService';
import Options from './types/Options';

let client: AsyncMqttClient;

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
    const allTopics = getAllStateTopicsFromObject(house);
    await client.subscribe(allTopics);
    initializeState(house);
    client.on('message', async (topic: string, payloadBuffer: Buffer)  => {
        const payload = payloadBuffer.toString();
        updateState(topic, payload);
        const state = getState();
        if (log) {
            console.log(JSON.stringify(state, null, 2));
        }
        await adjustVents(state, client);
        await adjustThermostat(state, client);
    });
};

export const stop = async (): Promise<void> => {
    await client.end();
};
