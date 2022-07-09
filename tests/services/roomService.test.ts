import {Chance} from 'chance';

import {allRoomsAreAtDesiredTemperature} from '../../src/services/roomService';

const chance = new Chance();

describe('roomService', () => {
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
