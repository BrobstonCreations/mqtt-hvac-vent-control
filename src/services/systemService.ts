import {AsyncMqttClient} from 'async-mqtt';
import {activeSystemCommandTopic, SYSTEM_NAME} from '../constants/system';

export const adjustSystem = async (topic: string, payload: string, client: AsyncMqttClient): Promise<void> => {
    if (topic === activeSystemCommandTopic) {
        switch (payload) {
            case 'true':
            case 'false':
                await client.publish(`stat/${SYSTEM_NAME}/active`, payload);
        }
    }
};

export const isActive = (
    messages: {[key: string]: string},
): boolean => messages[activeSystemCommandTopic] !== 'false';
