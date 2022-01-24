import {AsyncMqttClient} from 'async-mqtt';

import {House, Room, Vent} from '../types/Mqtt';

export const subscribeToAllTopics = async (
    {
       thermostat: {
           actualTemperatureStateTopic,
           targetTemperatureCommandTopic,
           targetTemperatureStateTopic,
       },
       rooms,
    }: House,
    client: AsyncMqttClient,
): Promise<void> => {
    const roomTopics = rooms.reduce((roomAccumulator: string[], room: Room) => {
        const ventStateTopics = room.vents.reduce((ventAccumulator: string[], {
            positionCommandTopic,
            positionStateTopic,
        }: Vent) => ([
            ...ventAccumulator,
            positionCommandTopic,
            positionStateTopic,
        ]), []);
        return [
            ...roomAccumulator,
            ...ventStateTopics,
            room.actualTemperatureStateTopic,
            room.targetTemperatureStateTopic,
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