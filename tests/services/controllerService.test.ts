import {act} from '../../src/services/controllerService';

describe('controllerService', () => {
    it('should act on state', () => {
        const state = {
            rooms: {
                room: {
                   actualTemperature: 72,
                    targetTemperature: 73,
                    vents: {
                        lu: {
                            position: null,
                        },
                    },
                },
            },
            thermostat: {
                actualTemperature: 72,
                name: 'thermostat',
                targetTemperature: 72,
            },
        };

        act(state);
    });
});
