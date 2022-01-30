import {AsyncMqttClient} from 'async-mqtt';
import * as State from '../types/State';
import {atLeastOneRoomNeedsHeatedOrCooled} from './roomService';
import {getMapMemoryToTopic} from './stateService';

export const adjustThermostat = async (house: State.House, client: AsyncMqttClient): Promise<void> => {
    const mapMemoryToTopic = getMapMemoryToTopic();
    const thermostatHeatModePayload = mapMemoryToTopic['thermostat.heatModePayload'];
    const thermostatCoolModePayload = mapMemoryToTopic['thermostat.coolModePayload'];
    const thermostatTargetTemperatureCommandTopic = mapMemoryToTopic['thermostat.targetTemperatureCommandTopic'];
    if (house.thermostat.actualTemperature) {
        if (atLeastOneRoomNeedsHeatedOrCooled(house, thermostatCoolModePayload, thermostatHeatModePayload)) {
            if (house.thermostat.action === mapMemoryToTopic['thermostat.idleActionPayload']) {
                console.log('thermostat is idle');
                const difference = determineDifference(
                    house.thermostat,
                    thermostatHeatModePayload,
                    thermostatCoolModePayload,
                );
                const targetTemperature = house.thermostat.actualTemperature + difference;
                if (house.thermostat.actualTemperature !== targetTemperature) {
                    await client.publish(thermostatTargetTemperatureCommandTopic, targetTemperature.toString());
                }
            }
        } else {
            await client.publish(thermostatTargetTemperatureCommandTopic,
                house.thermostat.actualTemperature.toString());
        }
    }
};

const determineDifference = (
    thermostat: State.Thermostat,
    thermostatHeatModePayload: string,
    thermostatCoolModePayload: string,
): number => {
    switch (thermostat.mode) {
        case thermostatHeatModePayload:
            return 1;
        case thermostatCoolModePayload:
            return -1;
        default:
            return 0;
    }
};
