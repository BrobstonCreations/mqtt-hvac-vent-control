import {AsyncMqttClient} from 'async-mqtt';
import * as State from '../types/State';
import {atLeastOneRoomNeedsHeatedOrCooled} from './roomService';
import {getMapMemoryToTopic} from './stateService';

export const actThermostat = async (house: State.House, client: AsyncMqttClient): Promise<void> => {
    const mapMemoryToTopic = getMapMemoryToTopic();
    const thermostatHeatModePayload = mapMemoryToTopic['thermostat.heatModePayload'];
    const thermostatCoolModePayload = mapMemoryToTopic['thermostat.coolModePayload'];
    const thermostatTargetTemperatureCommandTopic = mapMemoryToTopic['thermostat.targetTemperatureCommandTopic'];
    if (house.thermostat.actualTemperature && house.thermostat.targetTemperature) {
        if (atLeastOneRoomNeedsHeatedOrCooled(house, thermostatCoolModePayload, thermostatHeatModePayload)) {
            if (house.thermostat.mode === thermostatHeatModePayload) {
                const targetTemperature = house.thermostat.actualTemperature + 1;
                await client.publish(thermostatTargetTemperatureCommandTopic, targetTemperature.toString());
            } else if (house.thermostat.mode === thermostatCoolModePayload) {
                const targetTemperature = house.thermostat.actualTemperature - 1;
                await client.publish(thermostatTargetTemperatureCommandTopic, targetTemperature.toString());
            }
        } else if (atLeastOneRoomNeedsHeatedOrCooled(house, thermostatCoolModePayload, thermostatHeatModePayload)) {
            return;
        } else {
            await client.publish(thermostatTargetTemperatureCommandTopic,
                house.thermostat.actualTemperature.toString());
        }
    }
};
