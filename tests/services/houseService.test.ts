import {Chance} from 'chance';
import {isMode} from '../../src/services/houseService';

const chance = new Chance();

describe('houseService', () => {
    describe('isMode', () => {
        it('is night', () => {
            const modeNightPayload = 'night';
            const modeStateTopic = 'stat/house/mode';
            const messages = {
                [modeStateTopic]: modeNightPayload,
            };

            const mode = isMode(modeNightPayload, modeStateTopic, messages);

            expect(mode).toBe(true);
        });

        it('is day', () => {
            const modeDayPayload = 'day';
            const modeStateTopic = 'stat/house/mode';
            const messages = {
                [modeStateTopic]: modeDayPayload,
            };

            const mode = isMode(modeDayPayload, modeStateTopic, messages);

            expect(mode).toBe(true);
        });

        it('is NOT night', () => {
            const modeDayPayload = 'day';
            const modeNightPayload = 'night';
            const modeStateTopic = 'stat/house/mode';
            const messages = {
                [modeStateTopic]: modeDayPayload,
            };

            const mode = isMode(modeNightPayload, modeStateTopic, messages);

            expect(mode).toBe(false);
        });

        it('is NOT day', () => {
            const modeDayPayload = 'day';
            const modeNightPayload = 'night';
            const modeStateTopic = 'stat/house/mode';
            const messages = {
                [modeStateTopic]: modeNightPayload,
            };

            const mode = isMode(modeDayPayload, modeStateTopic, messages);

            expect(mode).toBe(false);
        });
    });
});
