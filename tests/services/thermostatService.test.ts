import {Chance} from 'chance';

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
            publish: jest.fn(),
        } as any;

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should decrease thermostat target temperature by 1', async () => {
            const messages = {
                [thermostat.actualTemperatureStateTopic]: 71,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [thermostat.actionStateTopic]: thermostat.idleActionPayload,
                [room.actualTemperatureStateTopic]: 72,
                [room.targetTemperatureStateTopic]: 71,
            };

            await adjustThermostat(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(thermostat.targetTemperatureCommandTopic, '70');
        });

        it('should do nothing because thermostat is NOT idle', async () => {
            const messages = {
                [thermostat.actualTemperatureStateTopic]: 71,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [thermostat.actionStateTopic]: thermostat.coolingActionPayload,
                [room.actualTemperatureStateTopic]: 72,
                [room.targetTemperatureStateTopic]: 71,
            };

            await adjustThermostat(house, messages, client);

            expect(client.publish).not.toHaveBeenCalled();
        });
    });
    describe('determineDifference', () => {
        it('should determine difference and return 1', () => {
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

            const difference = determineDifference(thermostat, messages);

            expect(difference).toBe(1);
        });

        it('should determine difference and return -1', () => {
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

            const difference = determineDifference(thermostat, messages);

            expect(difference).toBe(-1);
        });

        it('should determine difference and return 0', () => {
            const thermostat = {
                coolModePayload: chance.string(),
                heatModePayload: chance.string(),
                modeStateTopic: chance.string(),
            } as Thermostat;
            const messages = {};

            const difference = determineDifference(thermostat, messages);

            expect(difference).toBe(0);
        });
    });
});
