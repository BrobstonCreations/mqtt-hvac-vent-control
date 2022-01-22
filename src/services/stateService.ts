import * as Mqtt from '../types/Mqtt';
import * as State from '../types/State';

export const initializeState = (house: Mqtt.House): State.House => {
    return {
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

// export const updateState = (topic: string, payload: string, state: State.House): State.House => {
//
// };
