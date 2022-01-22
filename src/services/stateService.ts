import Mapping from '../types/Mapping';
import * as Mqtt from '../types/Mqtt';
import * as State from '../types/State';

import {createMappingObject} from './mappingService';

let state: State.House|undefined,
    mappingObject: Mapping;

export const initializeState = (house: Mqtt.House): void => {
    mappingObject = createMappingObject(house);
    state = {
        rooms: house.rooms.reduce((roomsAccumulator: State.Rooms, room: Mqtt.Room) => {
            return {
                ...roomsAccumulator,
                [room.name]: {
                    actualTemperature: null,
                    targetTemperature: null,
                    vents: room.vents.reduce((ventsAccumulator: State.Vents, vent: Mqtt.Vent) => {
                        return {
                            ...ventsAccumulator,
                            [vent.name]: {
                                position: null,
                            },
                        };
                    }, {}),
                },
            };
        }, {}),
        thermostat: {
            actualTemperature: null,
            name: house.thermostat.name,
            targetTemperature: null,
        },
    };
};

export const updateState = (topic: string, payload: string): void => {
    if (state) {
        state = {
            ...state,
            thermostat: {
                ...state.thermostat,
                actualTemperature: 72,
            },
        };
    }
};

export const getState = (): State.House | undefined => state;

export const clearState = (): void => {
    state = undefined;
};
