import {AsyncMqttClient} from 'async-mqtt';
import {House, Thermostat} from '../types/Mqtt';
import {atLeastOneRoomNeedsHeatedOrCooled} from './roomService';

export const adjustThermostat = async (house: House, messages: {[key: string]: string|number}, client: AsyncMqttClient):
    Promise<void> => {
    const {thermostat}: House = house;
    const thermostatActualTemperature = messages[thermostat.actualTemperatureStateTopic];
    if (thermostatActualTemperature) {
        const thermostatAction = messages[thermostat.actionStateTopic];
        const desiredState =
            atLeastOneRoomNeedsHeatedOrCooled(house, messages) && thermostatAction === thermostat.idleActionPayload ?
                'on' : 'off';
        const difference = determineDifference(desiredState, thermostat, messages);
        const targetTemperature = Number(thermostatActualTemperature) + difference;
        await client.publish(thermostat.targetTemperatureCommandTopic, targetTemperature.toString());
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
