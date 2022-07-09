import {House, Room, Vent} from '../types/Mqtt';

export const allRoomsAreAtDesiredTemperature = (house: House, messages: {[key: string]: string|number}): any => {
    const thermostatMode = messages[house.thermostat.modeStateTopic];
    return house.rooms.every((room: Room) => {
        const roomActualTemperature = messages[room.actualTemperatureStateTopic];
        const roomTargetTemperature = messages[room.targetTemperatureStateTopic];

        switch (thermostatMode) {
            case house.thermostat.coolModePayload:
                return roomActualTemperature <= roomTargetTemperature;
            case house.thermostat.heatModePayload:
                return roomActualTemperature >= roomTargetTemperature;
        }
    });
};

export const getAllVents = (rooms: Room[]): Vent[] =>
    rooms.reduce((accumulator: Vent[], room: Room) => [
        ...accumulator,
        ...room.vents,
    ], []);
