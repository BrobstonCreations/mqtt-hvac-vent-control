import {House, Room} from '../types/Mqtt';

export const allRoomsAreAtDesiredTemperature = (house: House, messages: {[key: string]: string|number}): boolean => {
    return house.rooms.every((room: Room) => {
        const thermostatMode = messages[house.thermostat.modeStateTopic];
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
