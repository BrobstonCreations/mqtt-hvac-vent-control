import {Chance} from 'chance';

import {getState, initializeState, updateState} from '../../src/services/stateService';

const chance = new Chance();

describe('stateService', () => {
    const vent = {
        closePayload: chance.word(),
        closedState: chance.word(),
        commandTopic: chance.word(),
        name: chance.word(),
        openPayload: chance.word(),
        openedState: chance.word(),
        positionStateTopic: chance.word(),
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

    it('should initialize and then update state', () => {
        initializeState(house);

        expect(getState()).toEqual({
            rooms: {
                [room.name]: {
                    actualTemperature: null,
                    targetTemperature: null,
                    vents: {
                        [vent.name]: {
                            position: null,
                        },
                    },
                },
            },
            thermostat: {
                actualTemperature: null,
                name: thermostat.name,
                targetTemperature: null,
            },
        });

        updateState(thermostat.actualTemperatureStateTopic, '72');

        expect(getState()).toEqual({
            rooms: {
                [room.name]: {
                    actualTemperature: null,
                    targetTemperature: null,
                    vents: {
                        [vent.name]: {
                            position: null,
                        },
                    },
                },
            },
            thermostat: {
                actualTemperature: 72,
                name: thermostat.name,
                targetTemperature: null,
            },
        });
    });
});