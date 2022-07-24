import {AsyncMqttClient} from 'async-mqtt';
import {Chance} from 'chance';

import {activeSystemCommandTopic, SYSTEM_NAME} from '../../src/constants/system';
import {adjustSystem, isActive} from '../../src/services/systemService';

const chance = new Chance();

afterEach(() => {
    jest.clearAllMocks();
});

describe('adjustSystem', () => {
    const client = {
        publish: jest.fn(() => Promise.resolve()) as any,
    } as AsyncMqttClient;

    it('should publish active state true', async () => {
        await adjustSystem(activeSystemCommandTopic, 'true', client);

        expect(client.publish).toHaveBeenCalledTimes(1);
        expect(client.publish).toHaveBeenCalledWith(`stat/${SYSTEM_NAME}/active`, 'true');
    });

    it('should publish active state false', async () => {
        await adjustSystem(activeSystemCommandTopic, 'false', client);

        expect(client.publish).toHaveBeenCalledTimes(1);
        expect(client.publish).toHaveBeenCalledWith(`stat/${SYSTEM_NAME}/active`, 'false');
    });

    it('should do nothing', async () => {
        await adjustSystem(chance.string(), chance.string(), client);

        expect(client.publish).not.toHaveBeenCalled();
    });
});

describe('isActive', () => {
    it('is active true', () => {
        const messages = {
            [activeSystemCommandTopic]: 'true',
        };
        expect(isActive(messages)).toBe(true);
    });

    it('is active false', () => {
        const messages = {
            [activeSystemCommandTopic]: 'false',
        };
        expect(isActive(messages)).toBe(false);
    });

    it('is active true if not set', () => {
        expect(isActive({})).toBe(true);
    });
});
