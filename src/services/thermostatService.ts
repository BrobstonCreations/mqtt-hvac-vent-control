import {AsyncMqttClient} from 'async-mqtt';
import {House, Thermostat} from '../types/Mqtt';
import {allRoomsAreAtDesiredTemperature} from './roomService';

export const adjustThermostat = async (
    house: House,
    messages: {[key: string]: string},
    client: AsyncMqttClient,
): Promise<void> => {
    const desiredState = determineDesiredState(house, messages);
    const difference = determineDifference(desiredState, house.thermostat, messages);
    if (difference !== 0) {
        const targetTemperature = Number(messages[house.thermostat.actualTemperatureStateTopic]) + difference;
        await client.publish(house.thermostat.targetTemperatureCommandTopic, targetTemperature.toString());
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

const determineDesiredState = (
    house: House,
    messages: {[key: string]: string},
): string => {
    const {thermostat: {actionStateTopic, idleActionPayload}}: House = house;
    const thermostatAction = messages[actionStateTopic];
    const thermostatIsIdle = thermostatAction === idleActionPayload;
    if (thermostatIsIdle && !allRoomsAreAtDesiredTemperature(house, messages)) {
        return 'on';
    } else if (!thermostatIsIdle && allRoomsAreAtDesiredTemperature(house, messages)) {
        return 'off';
    }
    return 'idle';
};
