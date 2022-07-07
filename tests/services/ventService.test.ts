import {Chance} from 'chance';

import {adjustVents} from '../../src/services/ventService';

const chance = new Chance();

describe('ventService', () => {
    describe('adjustVents', () => {
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
            publish: jest.fn(() => Promise.resolve()),
        } as any;

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: 71,
                [room.targetTemperatureStateTopic]: 70,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [vent.positionStateTopic]: vent.closedStatePayload,
            };

            await adjustVents(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
        });
    });
});
