import {AsyncMqttClient, Packet} from 'async-mqtt';

export const setupLogging = (client: AsyncMqttClient): void => {
    client.on('connect', (connack: any) => {
        console.log(`connected    | connack: ${JSON.stringify(connack)}`);
    });
    client.on('reconnect', () => {
        console.log('reconnected  |');
    });
    client.on('disconnect', () => {
        console.log('disconnected |');
    });
    client.on('message', (topic: string, message: string) => {
        console.log(`message      | topic: ${topic} | message: ${message}`);
    });
    client.on('error', (error: Error) => {
        console.log(`error        | ${error}`);
    });
    client.on('offline', () => {
        console.log('offline      |');
    });
    client.on('close', () => {
        console.log('closed       |');
    });
    client.on('end', () => {
        console.log('ended        |');
    });
};
