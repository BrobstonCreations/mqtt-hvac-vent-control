import {AsyncMqttClient, connect} from 'async-mqtt';

import Options from './types/Options';
import Room from './types/Room';
import Vent from './types/Vent';

import {setupLogging} from './services/logService';
import {getOptionsFromEnvironmentOrFile} from './services/optionService';
import {stat} from "fs";

let client: AsyncMqttClient;

export const start = async (
    options: Options = getOptionsFromEnvironmentOrFile(),
): Promise<void> => {
    const {
        configuration: {
            rooms,
            thermostat: {
                actualTemperatureStateTopic,
                targetTemperatureCommandTopic,
                targetTemperatureStateTopic,
            },
        },
        log,
        mqtt: {
            host,
            password,
            port,
            username,
        },
    }: Options = options;

    client = connect(`tcp://${host}:${port}`, {username, password});

    await client.subscribe([
        actualTemperatureStateTopic,
        targetTemperatureCommandTopic,
        targetTemperatureStateTopic,
    ]);
    await Promise.all(rooms.map((room: Room) => {
        const ventStateTopics = room.vents.reduce((accumulator: string[], {
            commandTopic,
            stateTopic,
        }: Vent) => ([
            ...accumulator,
            commandTopic,
            stateTopic,
        ]), []);
        return client.subscribe([
            ...ventStateTopics,
            room.actualTemperatureStateTopic,
            room.targetTemperatureCommandTopic,
        ]);
    }));

    await client.publish(targetTemperatureCommandTopic, '73');
    await client.publish(rooms[0].vents[0].commandTopic, 'open');

    if (log) {
        setupLogging(client);
    }
};

export const stop = async (): Promise<void> => {
    await client.end();
};
