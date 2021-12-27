import {AsyncMqttClient, connect} from 'async-mqtt';

import Options from './types/Options';

import {setupLogging} from './services/logService';
import {getOptionsFromEnvironmentOrFile} from './services/optionService';

let client: AsyncMqttClient;

export const start = async (
    options: Options = getOptionsFromEnvironmentOrFile(),
): Promise<void> => {
    const {
        log,
        mqtt: {
            host,
            password,
            port,
            username,
        },
    }: Options = options;

    client = connect(`tcp://${host}:${port}`, {username, password});

    const promises = options.config.rooms.map((room) => {
        return room.vents.map(() => {
            client.subscribe()
        });
    });

    await Promise.all(promises);

    if (log) {
        setupLogging(client);
    }
};

export const stop = async (): Promise<void> => {
    await client.end();
};
