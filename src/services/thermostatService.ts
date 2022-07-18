import {AsyncMqttClient} from 'async-mqtt';
import {SYSTEM_NAME} from '../constants/system';
import {House, Thermostat} from '../types/Mqtt';
import {allRoomsAreAtDesiredTemperature} from './roomService';

export const adjustThermostat = async (
    house: House,
    messages: {[key: string]: string},
    client: AsyncMqttClient,
): Promise<void> => {
    if (messages[`cmd/${SYSTEM_NAME}/pause`] !== 'true') {
        const {thermostat}: House = house;
        const thermostatAction = messages[thermostat.actionStateTopic];
        if (thermostatAction === thermostat.idleActionPayload) {
            !allRoomsAreAtDesiredTemperature(house, messages)
            && await publishThermostatAdjustment('on', thermostat, messages, client);
        } else {
            allRoomsAreAtDesiredTemperature(house, messages)
            && await publishThermostatAdjustment('off', thermostat, messages, client);
        }
    }
};

export const determineDifference = (
    desiredState: string,
    {modeStateTopic, heatModePayload, coolModePayload}: Thermostat,
    messages: {[key: string]: string},
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

const publishThermostatAdjustment = async (
    desiredState: string,
    thermostat: Thermostat,
    messages: {[key: string]: string},
    client: AsyncMqttClient,
): Promise<void> => {
    const difference = determineDifference(desiredState, thermostat, messages);
    const targetTemperature = Number(messages[thermostat.actualTemperatureStateTopic]) + difference;
    await client.publish(thermostat.targetTemperatureCommandTopic, targetTemperature.toString());
};
