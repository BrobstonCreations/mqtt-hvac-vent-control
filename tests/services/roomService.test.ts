import {Chance} from 'chance';

import {atLeastOneRoomNeedsHeatedOrCooled} from '../../src/services/roomService';

const chance = new Chance();

describe('roomService', () => {
    const thermostatCoolModePayload = chance.word();
    const thermostatHeatModePayload = chance.word();
    it.each([
        {
            actualRoomTemperature: 72,
            expected: true,
            name: 'should turn on hvac if thermostat is in heat mode and actual room temperature is less than target room temperature',
            targetRoomTemperature: 73,
            thermostatMode: thermostatHeatModePayload,
        },
        {
            actualRoomTemperature: 72,
            expected: true,
            name: 'should turn on hvac if thermostat is in cool mode and actual room temperature is greater than target room temperature',
            targetRoomTemperature: 71,
            thermostatMode: thermostatCoolModePayload,
        },
        {
            actualRoomTemperature: 72,
            expected: false,
            name: 'should not turn on hvac if thermostat is in heat mode and actual room temperature is equal to target room temperature',
            targetRoomTemperature: 72,
            thermostatMode: thermostatHeatModePayload,
        },
        {
            actualRoomTemperature: 72,
            expected: false,
            name: 'should not turn on hvac if thermostat is in cool mode and actual room temperature is equal to target room temperature',
            targetRoomTemperature: 72,
            thermostatMode: thermostatCoolModePayload,
        },
        {
            actualRoomTemperature: null,
            expected: false,
            name: 'should not turn on hvac if all null',
            targetRoomTemperature: null,
            thermostatMode: null,
        },
    ])('$name', ({
        actualRoomTemperature,
        expected,
        targetRoomTemperature,
        thermostatMode,
    }: any) => {
        const house = {
            rooms: {
                [chance.word()]: {
                    actualTemperature: actualRoomTemperature,
                    targetTemperature: targetRoomTemperature,
                    vents: {},
                },
            },
            thermostat: {
                action: null,
                actualTemperature: null,
                mode: thermostatMode,
                name: chance.word(),
                targetTemperature: null,
            },
        };

        const hvacOn = atLeastOneRoomNeedsHeatedOrCooled(house, thermostatCoolModePayload, thermostatHeatModePayload);

        expect(hvacOn).toBe(expected);
    });
});
