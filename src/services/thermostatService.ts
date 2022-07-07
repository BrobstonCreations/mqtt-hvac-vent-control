import {AsyncMqttClient} from 'async-mqtt';
import {House, Thermostat} from '../types/Mqtt';
import {atLeastOneRoomNeedsHeatedOrCooled} from './roomService';

export const adjustThermostat = async (house: House, messages: {[key: string]: string|number}, client: AsyncMqttClient):
    Promise<void> => {
    const {thermostat}: House = house;
    const thermostatActualTemperature = messages[thermostat.actualTemperatureStateTopic];
    if (thermostatActualTemperature) {
        if (atLeastOneRoomNeedsHeatedOrCooled(house, messages)) {
            const thermostatAction = messages[thermostat.actionStateTopic];
            if (thermostatAction === thermostat.idleActionPayload) {
                const difference = determineDifference(
                    'on',
                    thermostat,
                    messages,
                );
                const targetTemperature = Number(thermostatActualTemperature) + difference;
                await client.publish(thermostat.targetTemperatureCommandTopic, targetTemperature.toString());
            }
        } else {
            await client.publish(thermostat.targetTemperatureCommandTopic, thermostatActualTemperature.toString());
        }
    }
};

export const determineDifference = (
    desiredState: string,
    thermostat: Thermostat,
    messages: {[key: string]: string|number},
): number => {
    switch (messages[thermostat.modeStateTopic]) {
        case thermostat.heatModePayload:
            switch (desiredState) {
                case 'on':
                    return 1;
                case 'off':
                    return -1;
            }
        case thermostat.coolModePayload:
            switch (desiredState) {
                case 'on':
                    return -1;
                case 'off':
                    return 1;
            }
    }
    return 0;
};
