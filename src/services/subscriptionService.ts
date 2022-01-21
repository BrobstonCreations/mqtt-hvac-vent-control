import {AsyncMqttClient} from 'async-mqtt';

import Configuration from '../types/Configuration';
import Room from '../types/Room';
import Vent from '../types/Vent';

export const subscribeToAllTopics = async (
    {
       thermostat: {
           actualTemperatureStateTopic,
           targetTemperatureCommandTopic,
           targetTemperatureStateTopic,
       },
       rooms,
    }: Configuration,
    client: AsyncMqttClient,
): Promise<void> => {
    const roomTopics = rooms.reduce((roomAccumulator: string[], room: Room) => {
        const ventStateTopics = room.vents.reduce((ventAccumulator: string[], {
            commandTopic,
            stateTopic,
        }: Vent) => ([
            ...ventAccumulator,
            commandTopic,
            stateTopic,
        ]), []);
        return [
            ...roomAccumulator,
            ...ventStateTopics,
            room.actualTemperatureStateTopic,
            room.targetTemperatureCommandTopic,
        ];
    }, []);
    await client.subscribe([
        ...roomTopics,
        actualTemperatureStateTopic,
        targetTemperatureCommandTopic,
        targetTemperatureStateTopic,
    ]);
};