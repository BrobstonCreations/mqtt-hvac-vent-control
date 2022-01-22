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
            commandTopic,
            positionStateTopic,
        }: Vent) => ([
            ...ventAccumulator,
            commandTopic,
            positionStateTopic,
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