import {Chance} from 'chance';

import {atLeastOneRoomNeedsHeatedOrCooled} from '../../src/services/roomService';

const chance = new Chance();

describe('roomService', () => {
    const vent = {
        closePositionPayload: chance.word(),
        closedStatePayload: chance.word(),
        name: chance.word(),
        openPositionPayload: chance.word(),
        openedStatePayload: chance.word(),
        positionCommandTopic: chance.word(),
        positionStateTopic: chance.word(),
    };
    const room = {
        actualTemperatureStateTopic: chance.word(),
        name: chance.word(),
        targetTemperatureStateTopic: chance.word(),
        vents: [vent],
    };
    const thermostat = {
        actionStateTopic: chance.word(),
        actualTemperatureStateTopic: chance.word(),
        coolModePayload: chance.word(),
        coolingActionPayload: chance.word(),
        heatModePayload: chance.word(),
        heatingActionPayload: chance.word(),
        idleActionPayload: chance.word(),
        modeStateTopic: chance.word(),
        name: chance.word(),
        offModePayload: chance.word(),
        targetTemperatureCommandTopic: chance.word(),
        targetTemperatureStateTopic: chance.word(),
    };
    const house = {
        rooms: [room],
        thermostat,
    };
    it.each([
        {
            actualRoomTemperature: 72,
            expected: true,
            name: 'should turn on hvac if thermostat is in heat mode and actual room temperature is less than target room temperature',
            targetRoomTemperature: 73,
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoomTemperature: 72,
            expected: true,
            name: 'should turn on hvac if thermostat is in cool mode and actual room temperature is greater than target room temperature',
            targetRoomTemperature: 71,
            thermostatMode: thermostat.coolModePayload,
        },
        {
            actualRoomTemperature: 72,
            expected: false,
            name: 'should not turn on hvac if thermostat is in heat mode and actual room temperature is equal to target room temperature',
            targetRoomTemperature: 72,
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoomTemperature: 72,
            expected: false,
            name: 'should not turn on hvac if thermostat is in cool mode and actual room temperature is equal to target room temperature',
            targetRoomTemperature: 72,
            thermostatMode: thermostat.coolModePayload,
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
        const messages = {
            [house.thermostat.modeStateTopic]: thermostatMode,
            [room.actualTemperatureStateTopic]: actualRoomTemperature,
            [room.targetTemperatureStateTopic]: targetRoomTemperature,
        };

        const hvacOn = atLeastOneRoomNeedsHeatedOrCooled(house, messages);

        expect(hvacOn).toBe(expected);
    });

    it('should return false because there is no room data', () => {
        const messages = {};

        const hvacOn = atLeastOneRoomNeedsHeatedOrCooled(house, messages);

        expect(hvacOn).toBe(false);
    });
});
