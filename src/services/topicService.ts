import {House, Room, Vent} from '../types/Mqtt';

export const getAllTopics = (
    {
       thermostat: {
           actualTemperatureStateTopic,
           targetTemperatureCommandTopic,
           targetTemperatureStateTopic,
       },
       rooms,
    }: House,
): string[] => {
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
    const topics = [
        ...roomTopics,
        actualTemperatureStateTopic,
        targetTemperatureCommandTopic,
        targetTemperatureStateTopic,
    ];
    return topics;
};