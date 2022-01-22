import {Chance} from 'chance';

import {initializeState, updateState} from '../../src/services/stateService';

const chance = new Chance();

describe('stateService', () => {
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

    it('should initialize state', () => {
        const state = initializeState(house);

        expect(state).toEqual({
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

    it('should update state', () => {
        const state = initializeState(house);
        const updatedState = updateState(thermostat.actualTemperatureStateTopic, '72', state);

        expect(updatedState).toEqual({
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