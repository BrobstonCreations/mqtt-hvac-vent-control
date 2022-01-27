import {AsyncMqttClient} from 'async-mqtt';

export const message = (client: AsyncMqttClient): Promise<{ payload: string; topic: string }> =>
    new Promise((resolve: (obj: {payload: string; topic: string}) => void) => {
        client.on('message', (topic: string, payloadBuffer: Buffer) => {
            resolve({
                payload: payloadBuffer.toString(),
                topic,
            });
        });
    });
