import {AsyncMqttClient, connect} from 'async-mqtt';

import Options from './types/Options';

import {act} from './services/controllerService';
import {getOptionsFromEnvironmentOrFile} from './services/optionService';
import {getState, initializeState, updateState} from './services/stateService';
import {getAllTopicsFromObject} from './services/topicService';
import {setupLogging} from './services/logService';

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
    await client.subscribe(getAllTopicsFromObject(house, ['targetTemperatureCommandTopic']));
    initializeState(house);
    client.on('message', async (topic: string, payloadBuffer: Buffer)  => {
        const payload = payloadBuffer.toString();
        updateState(topic, payload);
        act(getState(), client);
    });
};

export const stop = async (): Promise<void> => {
    await client.end();
};
