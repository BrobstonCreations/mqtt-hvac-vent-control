import * as Mqtt from '../types/Mqtt';
import * as State from '../types/State';

let state: State.House;

export const initializeState = (house: Mqtt.House): State.House => {
    return {
        rooms: house.rooms.map((room: Mqtt.Room) => {
            return {
                actualTemperature: null,
                name: room.name,
                targetTemperature: null,
                vents: room.vents.map((vent: Mqtt.Vent) => {
                    return {
                        name: vent.name,
                        state: null,
                    };
                }),
            };
        }),
        thermostat: {
            actualTemperature: null,
            name: house.thermostat.name,
            targetTemperature: null,
        },
    };
};

export const updateState = (topic: string, payload: string, state: State.House): State.House => {

};
