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
