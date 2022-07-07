import {Chance} from 'chance';

import {allRoomsAreAtDesiredTemperature, atLeastOneRoomNeedsHeatedOrCooled} from '../../src/services/roomService';
import {Vent} from '../../src/types/Mqtt';

const chance = new Chance();

describe('roomService', () => {
    describe('', () => {
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

    describe('allRoomsAreAtDesiredTemperature', () => {
        const room1 = {
            actualTemperatureStateTopic: chance.string(),
            name: chance.string(),
            targetTemperatureStateTopic: chance.string(),
            vents: [],
        };
        const room2 = {
            actualTemperatureStateTopic: chance.string(),
            name: chance.string(),
            targetTemperatureStateTopic: chance.string(),
            vents: [],
        };
        const room3 = {
            actualTemperatureStateTopic: chance.string(),
            name: chance.string(),
            targetTemperatureStateTopic: chance.string(),
            vents: [],
        };
        const rooms = [room1, room2, room3];
        const thermostat = {
            actionStateTopic: 'stat/ecobee/action',
            actualTemperatureStateTopic: 'stat/ecobee/actual_temperature',
            coolModePayload: 'cool',
            coolingActionPayload: 'cooling',
            heatModePayload: 'heat',
            heatingActionPayload: 'heating',
            idleActionPayload: 'idle',
            modeStateTopic: 'stat/ecobee/mode',
            name: chance.word(),
            offModePayload: 'off',
            targetTemperatureCommandTopic: 'cmd/ecobee/temperature',
            targetTemperatureStateTopic: 'stat/ecobee/target_temperature',
        };
        const house = {
            rooms,
            thermostat,
        };

        it('should return true if cooling and room actual temperatures are below target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [room1.actualTemperatureStateTopic]: 70,
                [room1.targetTemperatureStateTopic]: 71,
                [room2.actualTemperatureStateTopic]: 72,
                [room2.targetTemperatureStateTopic]: 73,
                [room3.actualTemperatureStateTopic]: 74,
                [room3.targetTemperatureStateTopic]: 75,
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(true);
        });

        it('should return true if cooling and room actual temperatures is equal to target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [room1.actualTemperatureStateTopic]: 70,
                [room1.targetTemperatureStateTopic]: 70,
                [room2.actualTemperatureStateTopic]: 71,
                [room2.targetTemperatureStateTopic]: 71,
                [room3.actualTemperatureStateTopic]: 72,
                [room3.targetTemperatureStateTopic]: 72,
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(true);
        });

        it('should return false if cooling and one actual temperature is above target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [room1.actualTemperatureStateTopic]: 71,
                [room1.targetTemperatureStateTopic]: 70,
                [room2.actualTemperatureStateTopic]: 72,
                [room2.targetTemperatureStateTopic]: 73,
                [room3.actualTemperatureStateTopic]: 74,
                [room3.targetTemperatureStateTopic]: 75,
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(false);
        });

        it('should return true if heating and room actual temperatures are above target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.heatModePayload,
                [room1.actualTemperatureStateTopic]: 71,
                [room1.targetTemperatureStateTopic]: 70,
                [room2.actualTemperatureStateTopic]: 73,
                [room2.targetTemperatureStateTopic]: 72,
                [room3.actualTemperatureStateTopic]: 75,
                [room3.targetTemperatureStateTopic]: 74,
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(true);
        });

        it('should return true if heating and room actual temperatures is equal to target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.heatModePayload,
                [room1.actualTemperatureStateTopic]: 70,
                [room1.targetTemperatureStateTopic]: 70,
                [room2.actualTemperatureStateTopic]: 71,
                [room2.targetTemperatureStateTopic]: 71,
                [room3.actualTemperatureStateTopic]: 72,
                [room3.targetTemperatureStateTopic]: 72,
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(true);
        });

        it('should return false if cooling and one actual temperature is above target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.heatModePayload,
                [room1.actualTemperatureStateTopic]: 70,
                [room1.targetTemperatureStateTopic]: 71,
                [room2.actualTemperatureStateTopic]: 73,
                [room2.targetTemperatureStateTopic]: 72,
                [room3.actualTemperatureStateTopic]: 75,
                [room3.targetTemperatureStateTopic]: 74,
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(false);
        });
    });
});
