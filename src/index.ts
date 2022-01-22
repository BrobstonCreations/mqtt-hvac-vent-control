import {AsyncMqttClient, connect} from 'async-mqtt';

import Options from './types/Options';

import {setupLogging} from './services/logService';
import {getOptionsFromEnvironmentOrFile} from './services/optionService';
import {subscribeToAllTopics} from './services/subscriptionService';

let client: AsyncMqttClient;

export const start = async (
    options: Options = getOptionsFromEnvironmentOrFile(),
): Promise<void> => {
    const {
        house,
        log,
        mqtt: {
            host,
            password,
            port,
            username,
        },
    }: Options = options;

    client = connect(`tcp://${host}:${port}`, {username, password});

    await subscribeToAllTopics(house, client);

    await client.publish(house.thermostat.targetTemperatureCommandTopic, '73');
    await client.publish(house.rooms[0].vents[0].commandTopic, 'open');

    if (log) {
        setupLogging(client);
    }
};

export const stop = async (): Promise<void> => {
    await client.end();
};
