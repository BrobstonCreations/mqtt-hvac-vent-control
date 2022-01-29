import {AsyncMqttClient} from 'async-mqtt';
import * as State from '../types/State';
import {turnHvacOn} from './roomService';
import {getMapMemoryToTopic} from './stateService';

export const actThermostat = async (house: State.House, client: AsyncMqttClient): Promise<void> => {
    const mapMemoryToTopic = getMapMemoryToTopic();
    const thermostatHeatModePayload = mapMemoryToTopic['thermostat.heatModePayload'];
    const thermostatCoolModePayload = mapMemoryToTopic['thermostat.coolModePayload'];
    const thermostatTargetTemperatureCommandTopic = mapMemoryToTopic['thermostat.targetTemperatureCommandTopic'];
    if (house.thermostat.actualTemperature && house.thermostat.targetTemperature) {
        if (turnHvacOn(house, thermostatCoolModePayload, thermostatHeatModePayload)
            && house.thermostat.targetTemperature
            && house.thermostat.actualTemperature === house.thermostat.targetTemperature) {
            if (house.thermostat.mode === thermostatHeatModePayload) {
                const targetTemperature = house.thermostat.actualTemperature + 1;
                await client.publish(thermostatTargetTemperatureCommandTopic, targetTemperature.toString());
            } else if (house.thermostat.mode === thermostatCoolModePayload) {
                const targetTemperature = house.thermostat.actualTemperature - 1;
                await client.publish(thermostatTargetTemperatureCommandTopic, targetTemperature.toString());
            }
        } else if (turnHvacOn(house, thermostatCoolModePayload, thermostatHeatModePayload)) {
            await client.publish(thermostatTargetTemperatureCommandTopic,
                house.thermostat.targetTemperature.toString());
        } else {
            await client.publish(thermostatTargetTemperatureCommandTopic,
                house.thermostat.actualTemperature.toString());
        }
    }
};