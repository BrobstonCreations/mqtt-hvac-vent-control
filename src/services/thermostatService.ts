import {AsyncMqttClient} from 'async-mqtt';
import {House, Thermostat} from '../types/Mqtt';
import {allRoomsAreAtDesiredTemperature, atLeastOneRoomNeedsHeatedOrCooled} from './roomService';

export const adjustThermostat = async (house: House, messages: {[key: string]: string|number}, client: AsyncMqttClient):
    Promise<void> => {
    const {thermostat}: House = house;
    const thermostatActualTemperature = messages[thermostat.actualTemperatureStateTopic];
    if (thermostatActualTemperature) {
        const thermostatAction = messages[thermostat.actionStateTopic];
        if (atLeastOneRoomNeedsHeatedOrCooled(house, messages) && thermostatAction === thermostat.idleActionPayload) {
            const difference = determineDifference('on', thermostat, messages);
            const targetTemperature = Number(thermostatActualTemperature) + difference;
            await client.publish(thermostat.targetTemperatureCommandTopic, targetTemperature.toString());
        } else if (allRoomsAreAtDesiredTemperature(house, messages)
            && thermostatAction !== thermostat.idleActionPayload) {
            const difference = determineDifference('off', thermostat, messages);
            const targetTemperature = Number(thermostatActualTemperature) + difference;
            await client.publish(thermostat.targetTemperatureCommandTopic, targetTemperature.toString());
        }
    }
};

export const determineDifference = (
    desiredState: string,
    {modeStateTopic, heatModePayload, coolModePayload}: Thermostat,
    messages: {[key: string]: string|number},
): number => {
    const thermostatMode = messages[modeStateTopic];
    if ((thermostatMode === heatModePayload && desiredState === 'on')
        || (thermostatMode === coolModePayload && desiredState === 'off')) {
            return 1;
    } else if ((thermostatMode === heatModePayload && desiredState === 'off')
        || (thermostatMode === coolModePayload && desiredState === 'on')) {
            return -1;
    }
    return 0;
};
