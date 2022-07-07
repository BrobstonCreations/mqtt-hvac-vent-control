import {House, Room} from '../types/Mqtt';

export const atLeastOneRoomNeedsHeatedOrCooled = (
    {thermostat, rooms}: House,
    messages: {[key: string]: string|number},
): boolean =>
    rooms.some((room: Room) => {
        const actualTemperature = messages[room.actualTemperatureStateTopic];
        const targetTemperature = messages[room.targetTemperatureStateTopic];
        const thermostatMode = messages[thermostat.modeStateTopic];
        return actualTemperature
            && targetTemperature
            && (
                (thermostatMode === thermostat.heatModePayload && actualTemperature < targetTemperature)
                || (thermostatMode === thermostat.coolModePayload && actualTemperature > targetTemperature)
            );
    });

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
