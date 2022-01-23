import Mapping from '../types/Mapping';
import * as Mqtt from '../types/Mqtt';

export const createMappingObject = (house: Mqtt.House): any => {
    const roomsMapping = house.rooms.reduce((roomsAccumulator: Mapping, room: Mqtt.Room) => {
        const roomMapping = Object.keys(room).reduce((roomAccumulator: Mapping, key: string) => {
            if (key.endsWith('StateTopic')) {
                const stateTopic = getKeyValue(key)(room);
                const stateName = key.slice(0, key.indexOf('StateTopic'));
                const stateStorage = `rooms.${room.name}.${stateName}`;
                return {
                    ...roomAccumulator,
                    [stateTopic]: stateStorage,
                };
            }
            return roomAccumulator;
        }, {});
        const ventsMapping = room.vents.reduce((ventsAccumulator: Mapping, vent: Mqtt.Vent) => {
            const ventMapping = Object.keys(vent).reduce((ventAccumulator: Mapping, key: string) => {
                if (key.endsWith('StateTopic')) {
                    const stateTopic = getKeyValue(key)(vent);
                    const stateName = key.slice(0, key.indexOf('StateTopic'));
                    const stateStorage = `rooms.${room.name}.vents.${vent.name}.${stateName}`;
                    return {
                        ...ventAccumulator,
                        [stateTopic]: stateStorage,
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
        [house.thermostat.actualTemperatureStateTopic]: 'thermostat.actualTemperature',
        [house.thermostat.targetTemperatureStateTopic]: 'thermostat.targetTemperature',
        ...roomsMapping,
    };
};

const getKeyValue = (key: string): any => {
    return (obj: Record<string, any>): string => {
        return obj[key];
    };
};
