import * as State from '../types/State';

export const atLeastOneRoomNeedsHeatedOrCooled = (
    {thermostat, rooms}: State.House,
    thermostatCoolModePayload: string,
    thermostatHeatModePayload: string,
): boolean =>
    Object.keys(rooms).some((roomName: string) => {
        const {
            actualTemperature,
            targetTemperature,
        }: State.Room = rooms[roomName];
        return actualTemperature
            && targetTemperature
            && (
                (thermostat.mode === thermostatHeatModePayload && actualTemperature < targetTemperature)
                || (thermostat.mode === thermostatCoolModePayload && actualTemperature > targetTemperature)
            );
    });
