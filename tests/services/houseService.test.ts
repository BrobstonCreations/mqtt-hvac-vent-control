import {isMode} from '../../src/services/houseService';

describe('houseService', () => {
    describe('isMode', () => {
        it('is night', () => {
            const modeNightPayload = 'night';
            const modeStateTopic = 'stat/house/mode';
            const messages = {
                [modeStateTopic]: modeNightPayload,
            };

            const mode = isMode(messages, modeNightPayload, modeStateTopic);

            expect(mode).toBe(true);
        });

        it('is day', () => {
            const modeDayPayload = 'day';
            const modeStateTopic = 'stat/house/mode';
            const messages = {
                [modeStateTopic]: modeDayPayload,
            };

            const mode = isMode(messages, modeDayPayload, modeStateTopic);

            expect(mode).toBe(true);
        });

        it('is NOT night', () => {
            const modeDayPayload = 'day';
            const modeNightPayload = 'night';
            const modeStateTopic = 'stat/house/mode';
            const messages = {
                [modeStateTopic]: modeDayPayload,
            };

            const mode = isMode(messages, modeNightPayload, modeStateTopic);

            expect(mode).toBe(false);
        });

        it('is NOT day', () => {
            const modeDayPayload = 'day';
            const modeNightPayload = 'night';
            const modeStateTopic = 'stat/house/mode';
            const messages = {
                [modeStateTopic]: modeNightPayload,
            };

            const mode = isMode(messages, modeDayPayload, modeStateTopic);

            expect(mode).toBe(false);
        });

        it('modeStateTopic is NOT set', () => {
            const modeNightPayload = 'night';
            const modeStateTopic = undefined;
            const messages = {};

            const mode = isMode(messages, modeNightPayload, modeStateTopic);

            expect(mode).toBe(false);
        });
    });
});
