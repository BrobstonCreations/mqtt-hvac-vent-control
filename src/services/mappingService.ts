import Mapping from '../types/Mapping';
import * as Mqtt from '../types/Mqtt';

export const topicToMemory = (house: Mqtt.House): any => {
    const roomsMapping = house.rooms.reduce((roomsAccumulator: Mapping, room: Mqtt.Room) => {
        const roomMapping = Object.keys(room).reduce((roomAccumulator: Mapping, key: string) => {
            if (key.endsWith('Topic')) {
                const topic = getKeyValue(key)(room);
                const stateStorage = `rooms.${room.name}.${key}`;
                return {
                    ...roomAccumulator,
                    [topic]: stateStorage,
                };
            }
            return roomAccumulator;
        }, {});
        const ventsMapping = room.vents.reduce((ventsAccumulator: Mapping, vent: Mqtt.Vent) => {
            const ventMapping = Object.keys(vent).reduce((ventAccumulator: Mapping, key: string) => {
                if (key.endsWith('Topic')) {
                    const topic = getKeyValue(key)(vent);
                    const stateStorage = `rooms.${room.name}.vents.${vent.name}.${key}`;
                    return {
                        ...ventAccumulator,
                        [topic]: stateStorage,
                    };
                }
                return ventAccumulator;
            }, {});
            return {
                ...ventsAccumulator,
                ...ventMapping,
            };
        }, {});

        return {
            ...roomsAccumulator,
            ...roomMapping,
            ...ventsMapping,
        };
    }, {});

    return {
        [house.thermostat.actualTemperatureStateTopic]: 'thermostat.actualTemperatureStateTopic',
        [house.thermostat.targetTemperatureCommandTopic]: 'thermostat.targetTemperatureCommandTopic',
        [house.thermostat.targetTemperatureStateTopic]: 'thermostat.targetTemperatureStateTopic',
        ...roomsMapping,
    };
};

const getKeyValue = (key: string): any => {
    return (obj: Record<string, any>): string => {
        return obj[key];
    };
};
