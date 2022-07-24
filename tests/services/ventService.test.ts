import {Chance} from 'chance';

import {AsyncMqttClient} from 'async-mqtt';
import {SYSTEM_NAME} from '../../src/constants/system';
import {adjustRoomsVents, adjustVents, getVentPositionPayload, openAllVents} from '../../src/services/ventService';

const chance = new Chance();

describe('ventService', () => {
    const vent = {
        closePositionPayload: 'close',
        closedStatePayload: 'closed',
        closedWhenIdle: false,
        name: chance.word(),
        openPositionPayload: 'open',
        openedStatePayload: 'opened',
        positionCommandTopic: 'cmd/room_south/vent',
        positionStateTopic: 'stat/room_south/vent',
    };
    const room = {
        actualTemperatureStateTopic: 'stat/room/actual_temperature',
        modeCommandTopic: 'cmd/room/mode',
        name: chance.word(),
        targetTemperatureStateTopic: 'stat/room/target_temperature',
        vents: [vent],
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
    const client = {
        publish: jest.fn(() => Promise.resolve()) as any,
    } as AsyncMqttClient;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('adjustVents', () => {
        it('should open all vents if rooms are at desired temps', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: '70',
                [room.targetTemperatureStateTopic]: '71',
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [vent.positionStateTopic]: vent.closedStatePayload,
            };

            await adjustVents(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(vent.positionCommandTopic, vent.openPositionPayload);
        });

        it('should do nothing if system is paused', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: '71',
                [room.targetTemperatureStateTopic]: '70',
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [vent.positionStateTopic]: vent.closedStatePayload,
                [`cmd/${SYSTEM_NAME}/pause`]: 'true',
            };

            await adjustVents(house, messages, client);

            expect(client.publish).not.toHaveBeenCalled();
        });
    });

    describe('adjustRoomsVents', () => {
        it('should open vent when actual temp is above target and thermostat is cool mode', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: '71',
                [room.targetTemperatureStateTopic]: '70',
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [vent.positionStateTopic]: vent.closedStatePayload,
            };

            await adjustRoomsVents(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(vent.positionCommandTopic, vent.openPositionPayload);
        });

        it('should open vent when actual temp is below target and thermostat is heat mode', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: '70',
                [room.targetTemperatureStateTopic]: '71',
                [thermostat.modeStateTopic]: thermostat.heatModePayload,
                [vent.positionStateTopic]: vent.closedStatePayload,
            };

            await adjustRoomsVents(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(vent.positionCommandTopic, vent.openPositionPayload);
        });

        it('should close vent when actual temp is below target and thermostat is cool mode', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: '70',
                [room.targetTemperatureStateTopic]: '71',
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [vent.positionStateTopic]: vent.openedStatePayload,
            };

            await adjustRoomsVents(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(vent.positionCommandTopic, vent.closePositionPayload);
        });

        it('should close vent when actual temp is above target and thermostat is heat mode', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: '71',
                [room.targetTemperatureStateTopic]: '70',
                [thermostat.modeStateTopic]: thermostat.heatModePayload,
                [vent.positionStateTopic]: vent.openedStatePayload,
            };

            await adjustRoomsVents(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(vent.positionCommandTopic, vent.closePositionPayload);
        });

        it('should do nothing if thermostat mode is missing', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: '71',
                [room.targetTemperatureStateTopic]: '70',
                [vent.positionStateTopic]: vent.openedStatePayload,
            };

            await adjustRoomsVents(house, messages, client);

            expect(client.publish).not.toHaveBeenCalled();
        });

        it('should do nothing if needing to open, but already opened', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: '71',
                [room.targetTemperatureStateTopic]: '70',
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [vent.positionStateTopic]: vent.openedStatePayload,
            };

            await adjustRoomsVents(house, messages, client);

            expect(client.publish).not.toHaveBeenCalled();
        });
    });

    describe('openAllVents', () => {
        it ('open all vents if closed', async () => {
            const vent1 = {
                closePositionPayload: 'close',
                closedStatePayload: 'closed',
                name: chance.word(),
                openPositionPayload: 'open',
                openedStatePayload: 'opened',
                positionCommandTopic: 'cmd/room_south/vent',
                positionStateTopic: 'stat/room_south/vent',
            };
            const vent2 = {
                closePositionPayload: 'close',
                closedStatePayload: 'closed',
                name: chance.word(),
                openPositionPayload: 'open',
                openedStatePayload: 'opened',
                positionCommandTopic: 'cmd/room_north/vent',
                positionStateTopic: 'stat/room_north/vent',
            };
            const vent3 = {
                closePositionPayload: 'close',
                closedStatePayload: 'closed',
                name: chance.word(),
                openPositionPayload: 'open',
                openedStatePayload: 'opened',
                positionCommandTopic: 'cmd/room_east/vent',
                positionStateTopic: 'stat/room_east/vent',
            };
            const vents = [vent1, vent2, vent3];
            const messages = {
                [vent1.positionStateTopic]: vent1.closedStatePayload,
                [vent2.positionStateTopic]: vent2.closedStatePayload,
                [vent3.positionStateTopic]: vent3.openedStatePayload,
            };

            await openAllVents(vents, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(3);
            expect(client.publish).toHaveBeenCalledWith(vent1.positionCommandTopic, vent1.openPositionPayload);
            expect(client.publish).toHaveBeenCalledWith(vent2.positionCommandTopic, vent2.openPositionPayload);
            expect(client.publish).toHaveBeenCalledWith(vent3.positionCommandTopic, vent3.openPositionPayload);
        });
    });

    describe('getVentPositionPayload', () => {
        it('gets opened state payload', () => {
            const openedStatePayload = chance.string();
            const openPositionPayload = chance.string();

            const actual = getVentPositionPayload(openedStatePayload, {
                closePositionPayload: chance.string(),
                closedStatePayload: chance.string(),
                name: chance.word(),
                openPositionPayload,
                openedStatePayload,
                positionCommandTopic: chance.string(),
                positionStateTopic: chance.string(),
            });

            expect(actual).toBe(openPositionPayload);
        });

        it('gets close vent state payload', () => {
            const closedStatePayload = chance.string();
            const closePositionPayload = chance.string();

            const actual = getVentPositionPayload(closedStatePayload, {
                closePositionPayload,
                closedStatePayload,
                name: chance.word(),
                openPositionPayload: chance.string(),
                openedStatePayload: chance.string(),
                positionCommandTopic: chance.string(),
                positionStateTopic: chance.string(),
            });

            expect(actual).toBe(closePositionPayload);
        });

        it('gets no vent state payload', () => {
            const actual = getVentPositionPayload(chance.string(), {
                closePositionPayload: chance.string(),
                closedStatePayload: chance.string(),
                name: chance.word(),
                openPositionPayload: chance.string(),
                openedStatePayload: chance.string(),
                positionCommandTopic: chance.string(),
                positionStateTopic: chance.string(),
            });

            expect(actual).toBe(undefined);
        });
    });
});
