import {Chance} from 'chance';

import {determineDifference} from '../../src/services/thermostatService';
import {Thermostat} from '../../src/types/Mqtt';

const chance = new Chance();

describe('thermostatService', () => {
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
