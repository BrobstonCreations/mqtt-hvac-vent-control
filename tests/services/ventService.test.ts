import {Chance} from 'chance';

import {AsyncMqttClient} from 'async-mqtt';
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
            publish: jest.fn(() => Promise.resolve()) as any,
        } as AsyncMqttClient;

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should open vent when actual temp is above target and thermostat is cool mode', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: 71,
                [room.targetTemperatureStateTopic]: 70,
                [thermostat.modeStateTopic]: thermostat.coolModePayload,
                [vent.positionStateTopic]: vent.closedStatePayload,
            };

            await adjustVents(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(vent.positionCommandTopic, vent.openPositionPayload);
        });

        it('should open vent when actual temp is below target and thermostat is heat mode', async () => {
            const messages = {
                [room.actualTemperatureStateTopic]: 70,
                [room.targetTemperatureStateTopic]: 71,
                [thermostat.modeStateTopic]: thermostat.heatModePayload,
                [vent.positionStateTopic]: vent.closedStatePayload,
            };

            await adjustVents(house, messages, client);

            expect(client.publish).toHaveBeenCalledTimes(1);
            expect(client.publish).toHaveBeenCalledWith(vent.positionCommandTopic, vent.openPositionPayload);
        });
    });
});
