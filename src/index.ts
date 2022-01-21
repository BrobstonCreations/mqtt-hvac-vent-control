import {AsyncMqttClient, connect} from 'async-mqtt';

import Options from './types/Options';
import Room from './types/Room';
import Vent from './types/Vent';

import {setupLogging} from './services/logService';
import {getOptionsFromEnvironmentOrFile} from './services/optionService';
import {subscribeToAllTopics} from './services/subscriptionService';

let client: AsyncMqttClient;

export const start = async (
    options: Options = getOptionsFromEnvironmentOrFile(),
): Promise<void> => {
    const {
        configuration,
        log,
        mqtt: {
            host,
            password,
            port,
            username,
        },
    }: Options = options;

    client = connect(`tcp://${host}:${port}`, {username, password});

    await subscribeToAllTopics(configuration, client);

    await client.publish(configuration.thermostat.targetTemperatureCommandTopic, '73');
    await client.publish(configuration.rooms[0].vents[0].commandTopic, 'open');

    if (log) {
        setupLogging(client);
    }
};

export const stop = async (): Promise<void> => {
    await client.end();
};
