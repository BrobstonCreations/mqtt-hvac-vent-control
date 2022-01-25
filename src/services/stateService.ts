import {invert, set} from 'lodash';

import Mapping from '../types/Mapping';
import * as Mqtt from '../types/Mqtt';
import * as State from '../types/State';

import {topicToMemory} from './mappingService';

let state: State.House,
    mapTopicToMemory: Mapping,
    mapMemoryToTopic: Mapping;

export const initializeState = (house: Mqtt.House): void => {
    mapTopicToMemory = topicToMemory(house);
    mapMemoryToTopic = invert(mapTopicToMemory);
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
    const memoryPositionWithTopicLabel = mapTopicToMemory[topic];
    const memoryPosition = memoryPositionWithTopicLabel.slice(0, memoryPositionWithTopicLabel.indexOf('StateTopic'));
    set(state, memoryPosition, Number(payload));
};

export const getState = (): State.House => state;

export const getMapMemoryToTopic = (): Mapping => mapMemoryToTopic;
