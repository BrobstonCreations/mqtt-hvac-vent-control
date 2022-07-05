import {AsyncMqttClient} from 'async-mqtt';
import {House, Thermostat} from '../types/Mqtt';
import {atLeastOneRoomNeedsHeatedOrCooled} from './roomService';

export const adjustThermostat = async (house: House, messages: {[key: string]: string|number}, client: AsyncMqttClient):
    Promise<void> => {
    const {thermostat}: House = house;
    const actualTemperature = messages[thermostat.actualTemperatureStateTopic];
    if (actualTemperature) {
        if (atLeastOneRoomNeedsHeatedOrCooled(house, messages)) {
            const thermostatAction = messages[thermostat.actionStateTopic];
            if (thermostatAction === thermostat.idleActionPayload) {
                const difference = determineDifference(
                    thermostat,
                    messages,
                );
                const targetTemperature = Number(actualTemperature) + difference;
                if (actualTemperature !== targetTemperature) {
                    await client.publish(thermostat.targetTemperatureCommandTopic, targetTemperature.toString());
                }
            }
        } else {
            await client.publish(thermostat.targetTemperatureCommandTopic, actualTemperature.toString());
        }
    }
};

export const determineDifference = (
    thermostat: Thermostat,
    messages: {[key: string]: string|number},
): number => {
    switch (messages[thermostat.modeStateTopic]) {
        case thermostat.heatModePayload:
            return 1;
        case thermostat.coolModePayload:
            return -1;
        default:
            return 0;
    }
};
