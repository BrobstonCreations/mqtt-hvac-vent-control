import {AsyncMqttClient} from 'async-mqtt';
import {Chance} from 'chance';

import {
    adjustRooms,
    allRoomsAreAtDesiredTemperature,
    getAllNighttimeRooms,
    getAllNighttimeVents,
    getAllOpenWhenIdleVents,
    getAllVents,
} from '../../src/services/roomService';

const chance = new Chance();

afterEach(() => {
    jest.clearAllMocks();
});

describe('roomService', () => {
    const client = {
        publish: jest.fn(() => Promise.resolve()) as any,
    } as AsyncMqttClient;

    describe('adjustRooms', () => {
        const room = {
            actualTemperatureStateTopic: chance.string(),
            modeCommandTopic: chance.string(),
            name: chance.string(),
            targetTemperatureStateTopic: chance.string(),
            vents: [],
        };
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
            rooms: [room],
            thermostat,
        };

        it('should command room cool if thermostat cool, is nighttime, and is nighttime room', async () => {
            const modeStateTopic = 'stat/house/mode';
            const modeNighttimePayload = 'night';
            const messages = {
                [modeStateTopic]: modeNighttimePayload,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [room.targetTemperatureStateTopic]: '70',
                [room.actualTemperatureStateTopic]: '71',
            };
            const houseInNightMode = {
                ...house,
                modeNighttimePayload,
                modeStateTopic,
                rooms: [{
                    ...room,
                    isNighttimeRoom: true,
                }],
            };

            await adjustRooms(houseInNightMode, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(room.modeCommandTopic, 'cool');
        });

        it('should command room heat if thermostat heat, is nighttime, and is nighttime room', async () => {
            const modeStateTopic = 'stat/house/mode';
            const modeNighttimePayload = 'night';
            const messages = {
                [modeStateTopic]: modeNighttimePayload,
                [thermostat.modeStateTopic]: thermostat.heatModePayload,
                [room.targetTemperatureStateTopic]: '71',
                [room.actualTemperatureStateTopic]: '70',
            };
            const houseInNightMode = {
                ...house,
                modeNighttimePayload,
                modeStateTopic,
                rooms: [{
                    ...room,
                    isNighttimeRoom: true,
                }],
            };

            await adjustRooms(houseInNightMode, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(room.modeCommandTopic, 'heat');
        });

        it('should command room off if is nighttime and is NOT nighttime room', async () => {
            const modeStateTopic = 'stat/house/mode';
            const modeNighttimePayload = 'night';
            const messages = {
                [modeStateTopic]: modeNighttimePayload,
                [room.targetTemperatureStateTopic]: '70',
                [room.actualTemperatureStateTopic]: '71',
            };
            const houseInNightMode = {
                ...house,
                modeNighttimePayload,
                modeStateTopic,
            };

            await adjustRooms(houseInNightMode, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(room.modeCommandTopic, 'off');
        });

        it('should command room off if missing target or actual temperature', async () => {
            const messages = {};

            await adjustRooms(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(room.modeCommandTopic, 'off');
        });
    });

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
        const rooms = [room1, room2];
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
                [room1.actualTemperatureStateTopic]: '70',
                [room1.targetTemperatureStateTopic]: '71',
                [room2.actualTemperatureStateTopic]: '72',
                [room2.targetTemperatureStateTopic]: '73',
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(true);
        });

        it('should return true if cooling and room actual temperatures is equal to target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [room1.actualTemperatureStateTopic]: '70',
                [room1.targetTemperatureStateTopic]: '70',
                [room2.actualTemperatureStateTopic]: '71',
                [room2.targetTemperatureStateTopic]: '71',
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(true);
        });

        it('should return false if cooling and one actual temperature is above target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [room1.actualTemperatureStateTopic]: '71',
                [room1.targetTemperatureStateTopic]: '70',
                [room2.actualTemperatureStateTopic]: '72',
                [room2.targetTemperatureStateTopic]: '73',
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(false);
        });

        it('should return true if heating and room actual temperatures are above target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.heatModePayload,
                [room1.actualTemperatureStateTopic]: '71',
                [room1.targetTemperatureStateTopic]: '70',
                [room2.actualTemperatureStateTopic]: '73',
                [room2.targetTemperatureStateTopic]: '72',
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(true);
        });

        it('should return true if heating and room actual temperatures is equal to target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.heatModePayload,
                [room1.actualTemperatureStateTopic]: '70',
                [room1.targetTemperatureStateTopic]: '70',
                [room2.actualTemperatureStateTopic]: '71',
                [room2.targetTemperatureStateTopic]: '71',
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(true);
        });

        it('should return false if cooling and one actual temperature is above target temperature', () => {
            const messages = {
                [thermostat.modeStateTopic]: thermostat.heatModePayload,
                [room1.actualTemperatureStateTopic]: '70',
                [room1.targetTemperatureStateTopic]: '71',
                [room2.actualTemperatureStateTopic]: '73',
                [room2.targetTemperatureStateTopic]: '72',
            };

            expect(allRoomsAreAtDesiredTemperature(house, messages)).toBe(false);
        });

        it('should return true if is night, is cooling, ' +
            'and night room\'s actual temperatures are below target temperature', () => {
            const modeStateTopic = 'stat/house/mode';
            const modeNighttimePayload = 'night';
            const messages = {
                [modeStateTopic]: modeNighttimePayload,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [room1.actualTemperatureStateTopic]: '70',
                [room1.targetTemperatureStateTopic]: '71',
                [room2.actualTemperatureStateTopic]: '73',
                [room2.targetTemperatureStateTopic]: '72',
            };
            const houseInNightMode = {
                ...house,
                modeNighttimePayload,
                modeStateTopic,
                rooms: [
                    {
                        ...room1,
                        isNighttimeRoom: true,
                    },
                    room2,
                ],
            };

            expect(allRoomsAreAtDesiredTemperature(houseInNightMode, messages)).toBe(true);
        });

        it('should return false if is day, is cooling, ' +
            'and night room\'s actual temperatures are below target temperature', () => {
            const modeStateTopic = 'stat/house/mode';
            const modeNighttimePayload = 'night';
            const modeDaytimePayload = 'day';
            const messages = {
                [modeStateTopic]: modeDaytimePayload,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [room1.actualTemperatureStateTopic]: '70',
                [room1.targetTemperatureStateTopic]: '71',
                [room2.actualTemperatureStateTopic]: '73',
                [room2.targetTemperatureStateTopic]: '72',
            };
            const houseInNightMode = {
                ...house,
                modeNighttimePayload,
                modeStateTopic,
                rooms: [
                    {
                        ...room1,
                        isNighttimeRoom: true,
                    },
                    room2,
                ],
            };

            expect(allRoomsAreAtDesiredTemperature(houseInNightMode, messages)).toBe(false);
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

    describe('getAllNighttimeRooms', () => {
        it('should return vents that are isBedroom true', () => {
            const room1 = {
                actualTemperatureStateTopic: 'stat/room1/actual_temperature',
                isNighttimeRoom: true,
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

            const rooms = getAllNighttimeRooms([room1, room2]);

            expect(rooms).toEqual([room1]);
        });
    });

    describe('getAllNighttimeVents', () => {
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
                isNighttimeRoom: true,
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

            const vents = getAllNighttimeVents(rooms);

            expect(vents).toEqual([vent1]);
        });
    });
});
