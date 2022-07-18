import {Chance} from 'chance';

import {AsyncMqttClient} from 'async-mqtt';
import {SYSTEM_NAME} from '../../src/constants/system';
import {adjustThermostat, determineDifference} from '../../src/services/thermostatService';
import {Thermostat} from '../../src/types/Mqtt';

const chance = new Chance();

describe('thermostatService', () => {
    describe('adjustThermostat', () => {
        const vent = {
            closePositionPayload: 'close',
            closedStatePayload: 'closed',
            name: chance.word(),
            openPositionPayload: 'open',
            openedStatePayload: 'opened',
            positionCommandTopic: 'cmd/room_south/vent',
            positionStateTopic: 'stat/room_south/vent',
        };
        const room = {
            actualTemperatureStateTopic: 'stat/room/actual_temperature',
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

        it('should decrease thermostat target temperature by 1', async () => {
            const messages = {
                [thermostat.actualTemperatureStateTopic]: 71,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [thermostat.actionStateTopic]: thermostat.idleActionPayload,
                [room.actualTemperatureStateTopic]: 75,
                [room.targetTemperatureStateTopic]: 74,
            };

            await adjustThermostat(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(thermostat.targetTemperatureCommandTopic, '70');
        });

        it('should increase thermostat target temperature by 1 if all room\'s actual temperatures are at or above the target temperature', async () => {
            const messages = {
                [thermostat.actualTemperatureStateTopic]: 72,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [thermostat.actionStateTopic]: thermostat.coolingActionPayload,
                [room.actualTemperatureStateTopic]: 74,
                [room.targetTemperatureStateTopic]: 75,
            };

            await adjustThermostat(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(thermostat.targetTemperatureCommandTopic, '73');
        });

        it('should continue cooling if at least one room\'s actual temperatures are is below target', async () => {
            const messages = {
                [thermostat.actualTemperatureStateTopic]: 72,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [thermostat.actionStateTopic]: thermostat.coolingActionPayload,
                [room.actualTemperatureStateTopic]: 74,
                [room.targetTemperatureStateTopic]: 73,
            };

            await adjustThermostat(house, messages, client);

            expect(client.publish).not.toHaveBeenCalled();
        });

        it('should remain idle if all rooms are at desired temperature', async () => {
            const messages = {
                [thermostat.actualTemperatureStateTopic]: 71,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [thermostat.actionStateTopic]: thermostat.idleActionPayload,
                [room.actualTemperatureStateTopic]: 74,
                [room.targetTemperatureStateTopic]: 75,
            };

            await adjustThermostat(house, messages, client);

            expect(client.publish).not.toHaveBeenCalled();
        });

        it('should do nothing if system is paused', async () => {
            const messages = {
                [thermostat.actualTemperatureStateTopic]: 71,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [thermostat.actionStateTopic]: thermostat.idleActionPayload,
                [room.actualTemperatureStateTopic]: 75,
                [room.targetTemperatureStateTopic]: 74,
                [`cmd/${SYSTEM_NAME}/pause`]: 'true',
            };

            await adjustThermostat(house, messages, client);

            expect(client.publish).not.toHaveBeenCalled();
        });
    });

    describe('determineDifference', () => {
        it('should return 1 for turning on heating mode', () => {
            const heatModePayload = chance.string();
            const modeStateTopic = chance.string();
            const thermostat = {
                coolModePayload: chance.string(),
                heatModePayload,
                modeStateTopic,
            } as Thermostat;
            const messages = {
                [modeStateTopic]: heatModePayload,
            };

            const difference = determineDifference('on', thermostat, messages);

            expect(difference).toBe(1);
        });

        it('should return -1 for turning off heating mode', () => {
            const heatModePayload = chance.string();
            const modeStateTopic = chance.string();
            const thermostat = {
                coolModePayload: chance.string(),
                heatModePayload,
                modeStateTopic,
            } as Thermostat;
            const messages = {
                [modeStateTopic]: heatModePayload,
            };

            const difference = determineDifference('off', thermostat, messages);

            expect(difference).toBe(-1);
        });

        it('should return -1 for turning on cooling mode', () => {
            const coolModePayload = chance.string();
            const modeStateTopic = chance.string();
            const thermostat = {
                coolModePayload,
                heatModePayload: chance.string(),
                modeStateTopic,
            } as Thermostat;
            const messages = {
                [modeStateTopic]: coolModePayload,
            };

            const difference = determineDifference('on', thermostat, messages);

            expect(difference).toBe(-1);
        });

        it('should return 1 for turning off cooling mode', () => {
            const coolModePayload = chance.string();
            const modeStateTopic = chance.string();
            const thermostat = {
                coolModePayload,
                heatModePayload: chance.string(),
                modeStateTopic,
            } as Thermostat;
            const messages = {
                [modeStateTopic]: coolModePayload,
            };

            const difference = determineDifference('off', thermostat, messages);

            expect(difference).toBe(1);
        });

        it('should return 0 for on and unintended state', () => {
            const thermostat = {
                coolModePayload: chance.string(),
                heatModePayload: chance.string(),
                modeStateTopic: chance.string(),
            } as Thermostat;
            const messages = {};

            const difference = determineDifference('on', thermostat, messages);

            expect(difference).toBe(0);
        });

        it('should return 0 for off and unintended state', () => {
            const thermostat = {
                coolModePayload: chance.string(),
                heatModePayload: chance.string(),
                modeStateTopic: chance.string(),
            } as Thermostat;
            const messages = {};

            const difference = determineDifference('off', thermostat, messages);

            expect(difference).toBe(0);
        });
    });
});
