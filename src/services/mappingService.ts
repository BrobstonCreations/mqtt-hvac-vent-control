import Mapping from '../types/Mapping';
import * as Mqtt from '../types/Mqtt';

export const createMappingObject = (house: Mqtt.House): any => {
    const roomsMapping = house.rooms.reduce((roomsAccumulator: Mapping, room: Mqtt.Room) => {
        const roomMapping = Object.keys(room).reduce((roomAccumulator: Mapping, key: string) => {
            if (key.endsWith('StateTopic')) {
                const stateTopic = getKeyValue(key)(room);
                const stateName = key.slice(0, key.indexOf('StateTopic'));
                const stateStorage = `house.rooms.${room.name}.${stateName}`;
                return {
                    ...roomAccumulator,
                    [stateTopic]: stateStorage,
                };
            }
            return roomAccumulator;
        }, {});

        return {
            ...roomsAccumulator,
            ...roomMapping,
        };
    }, {});

    return {
        [house.thermostat.actualTemperatureStateTopic]: 'house.thermostat.actualTemperature',
        [house.thermostat.targetTemperatureStateTopic]: 'house.thermostat.targetTemperature',
        ...roomsMapping,
    };
};

const getKeyValue = (key: string): any => {
    return (obj: Record<string, any>): string => {
        return obj[key];
    };
};
