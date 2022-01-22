import {Chance} from 'chance';

import {initializeState} from '../../src/services/stateService';

const chance = new Chance();

describe('stateService', () => {
    it('should initialize state', () => {
        const vent = {
            closePayload: chance.word(),
            closedState: chance.word(),
            commandTopic: chance.word(),
            name: chance.word(),
            openPayload: chance.word(),
            openedState: chance.word(),
            stateTopic: chance.word(),
        };
        const room = {
            actualTemperatureStateTopic: chance.word(),
            name: chance.word(),
            targetTemperatureCommandTopic: chance.word(),
            targetTemperatureStateTopic: chance.word(),
            vents: [vent],
        };
        const thermostat = {
            actualTemperatureStateTopic: chance.word(),
            name: chance.word(),
            targetTemperatureCommandTopic: chance.word(),
            targetTemperatureStateTopic: chance.word(),
        };
        const house = {
            rooms: [room],
            thermostat,
        };

        const houseState = initializeState(house);

        expect(houseState).toEqual({
            rooms: [
                {
                    actualTemperature: null,
                    name: room.name,
                    targetTemperature: null,
                    vents: [
                        {
                            name: vent.name,
                            state: null,
                        },
                    ],
                },
            ],
            thermostat: {
                actualTemperature: null,
                name: thermostat.name,
                targetTemperature: null,
            },
        });
    });
});