import {AsyncMqttClient} from 'async-mqtt';
import {Chance} from 'chance';

import {SYSTEM_NAME} from '../../src/constants/system';
import {adjustSystem} from '../../src/services/systemService';

const chance = new Chance();

afterEach(() => {
    jest.clearAllMocks();
});

describe('adjustSystem', () => {
    const client = {
        publish: jest.fn(() => Promise.resolve()) as any,
    } as AsyncMqttClient;

    it('should publish pause state true', async () => {
        await adjustSystem(`cmd/${SYSTEM_NAME}/pause`, 'true', client);

        expect(client.publish).toHaveBeenCalledTimes(1);
        expect(client.publish).toHaveBeenCalledWith(`stat/${SYSTEM_NAME}/pause`, 'true');
    });

    it('should publish pause state false', async () => {
        await adjustSystem(`cmd/${SYSTEM_NAME}/pause`, 'false', client);

        expect(client.publish).toHaveBeenCalledTimes(1);
        expect(client.publish).toHaveBeenCalledWith(`stat/${SYSTEM_NAME}/pause`, 'false');
    });

    it('should do nothing', async () => {
        await adjustSystem(chance.string(), chance.string(), client);

        expect(client.publish).not.toHaveBeenCalled();
    });
});
