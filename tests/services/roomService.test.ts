import {Chance} from 'chance';

import {
    allRoomsAreAtDesiredTemperature,
    getAllVents,
    getAllOpenWhenIdleVents, getAllBedroomVents, getAllBedrooms,
} from '../../src/services/roomService';

const chance = new Chance();

describe('roomService', () => {
    describe('allRoomsAreAtDesiredTemperature', () => {
        const room1 = {
            actualTemperatureStateTopic: chance.string(),
            modeCommandTopic: chance.string(),
            name: chance.string(),
            targetTemperatureStateTopic: chance.string(),
            vents: [],
        };
        const room2 = {
            actualTemperatureStateTopic: chance.string(),
            modeCommandTopic: chance.string(),
            name: chance.string(),
            targetTemperatureStateTopic: chance.string(),
            vents: [],
        };
        const room3 = {
            actualTemperatureStateTopic: chance.string(),
            modeCommandTopic: chance.string(),
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

        it('should return false if no messages', () => {
            const messages = {};

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(false);
        });
    });

    describe('getAllVents', () => {
        it('get all vents', async () => {
            const vent1 = {
                closePositionPayload: 'close',
                closedStatePayload: 'closed',
                name: chance.word(),
                openPositionPayload: 'open',
                openedStatePayload: 'opened',
                positionCommandTopic: 'cmd/south/vent',
                positionStateTopic: 'stat/south/vent',
            };
            const room1 = {
                actualTemperatureStateTopic: 'stat/room1/actual_temperature',
                modeCommandTopic: 'cmd/room1/mode',
                name: chance.word(),
                targetTemperatureStateTopic: 'stat/room1/target_temperature',
                vents: [vent1],
            };
            const vent2 = {
                closePositionPayload: 'close',
                closedStatePayload: 'closed',
                name: chance.word(),
                openPositionPayload: 'open',
                openedStatePayload: 'opened',
                positionCommandTopic: 'cmd/north/vent',
                positionStateTopic: 'stat/north/vent',
            };
            const room2 = {
                actualTemperatureStateTopic: 'stat/room2/actual_temperature',
                modeCommandTopic: 'cmd/room2/mode',
                name: chance.word(),
                targetTemperatureStateTopic: 'stat/room2/target_temperature',
                vents: [vent2],
            };
            const rooms = [room1, room2];

            const vents = getAllVents(rooms);

            expect(vents).toEqual([vent1, vent2]);
        });
    });

    describe('getAllOpenWhenIdleVents', () => {
        it('should return vents that are not closed when idle', () => {
            const vent1 = {
                closePositionPayload: 'close',
                closedStatePayload: 'closed',
                name: chance.word(),
                openPositionPayload: 'open',
                openedStatePayload: 'opened',
                positionCommandTopic: 'cmd/south/vent',
                positionStateTopic: 'stat/south/vent',
            };
            const room1 = {
                actualTemperatureStateTopic: 'stat/room1/actual_temperature',
                modeCommandTopic: 'cmd/room1/mode',
                name: chance.word(),
                targetTemperatureStateTopic: 'stat/room1/target_temperature',
                vents: [vent1],
            };
            const vent2 = {
                closePositionPayload: 'close',
                closedStatePayload: 'closed',
                closedWhenIdle: true,
                name: chance.word(),
                openPositionPayload: 'open',
                openedStatePayload: 'opened',
                positionCommandTopic: 'cmd/north/vent',
                positionStateTopic: 'stat/north/vent',
            };
            const room2 = {
                actualTemperatureStateTopic: 'stat/room2/actual_temperature',
                modeCommandTopic: 'cmd/room2/mode',
                name: chance.word(),
                targetTemperatureStateTopic: 'stat/room2/target_temperature',
                vents: [vent2],
            };
            const rooms = [room1, room2];

            const vents = getAllOpenWhenIdleVents(rooms);

            expect(vents).toEqual([vent1]);
        });
    });

    describe('getAllBedrooms', () => {
        it('should return vents that are isBedroom true', () => {
            const room1 = {
                actualTemperatureStateTopic: 'stat/room1/actual_temperature',
                isBedroom: true,
                modeCommandTopic: 'cmd/room1/mode',
                name: chance.word(),
                targetTemperatureStateTopic: 'stat/room1/target_temperature',
                vents: [],
            };
            const room2 = {
                actualTemperatureStateTopic: 'stat/room2/actual_temperature',
                modeCommandTopic: 'cmd/room2/mode',
                name: chance.word(),
                targetTemperatureStateTopic: 'stat/room2/target_temperature',
                vents: [],
            };
            const rooms = [room1, room2];

            const vents = getAllBedrooms(rooms);

            expect(vents).toEqual([room1]);
        });
    });

    describe('getAllBedroomVents', () => {
        it('should return vents that are isBedroom true', () => {
            const vent1 = {
                closePositionPayload: 'close',
                closedStatePayload: 'closed',
                name: chance.word(),
                openPositionPayload: 'open',
                openedStatePayload: 'opened',
                positionCommandTopic: 'cmd/south/vent',
                positionStateTopic: 'stat/south/vent',
            };
            const room1 = {
                actualTemperatureStateTopic: 'stat/room1/actual_temperature',
                isBedroom: true,
                modeCommandTopic: 'cmd/room1/mode',
                name: chance.word(),
                targetTemperatureStateTopic: 'stat/room1/target_temperature',
                vents: [vent1],
            };
            const vent2 = {
                closePositionPayload: 'close',
                closedStatePayload: 'closed',
                name: chance.word(),
                openPositionPayload: 'open',
                openedStatePayload: 'opened',
                positionCommandTopic: 'cmd/north/vent',
                positionStateTopic: 'stat/north/vent',
            };
            const room2 = {
                actualTemperatureStateTopic: 'stat/room2/actual_temperature',
                modeCommandTopic: 'cmd/room2/mode',
                name: chance.word(),
                targetTemperatureStateTopic: 'stat/room2/target_temperature',
                vents: [vent2],
            };
            const rooms = [room1, room2];

            const vents = getAllBedroomVents(rooms);

            expect(vents).toEqual([vent1]);
        });
    });
});
