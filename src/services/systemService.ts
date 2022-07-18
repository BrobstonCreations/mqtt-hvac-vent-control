import {AsyncMqttClient} from 'async-mqtt';
import {SYSTEM_NAME} from '../constants/system';

export const adjustSystem = async (topic: string, payload: string, client: AsyncMqttClient): Promise<void> => {
    if (topic === `cmd/${SYSTEM_NAME}/pause`) {
        switch (payload) {
            case 'true':
            case 'false':
                await client.publish(`stat/${SYSTEM_NAME}/pause`, payload);
        }
    }
};
