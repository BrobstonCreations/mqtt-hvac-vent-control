import {AsyncMqttClient, Packet} from 'async-mqtt';

export const setupLogging = (client: AsyncMqttClient): void => {
    client.on('connect', (connack: any) => {
        console.log(`| connected     | connack: ${JSON.stringify(connack)}`);
    });
    client.on('reconnect', () => {
        console.log('| reconnected   |');
    });
    client.on('disconnect', () => {
        console.log('| disconnected  |');
    });
    client.on('message', (topic: string, message: string, packet: Packet) => {
        console.log(`| message       | topic: ${topic}, message: ${message}, packet: ${JSON.stringify(packet)}`);
    });
    client.on('packetsend', (packet: Packet) => {
        console.log(`| packetsend    | packet: ${JSON.stringify(packet)}`);
    });
    client.on('packetreceive', (packet: Packet) => {
        console.log(`| packetreceive | packet: ${JSON.stringify(packet)}`);
    });
    client.on('error', (error: Error) => {
        console.log(`| error         | ${error}`);
    });
    client.on('offline', () => {
        console.log('| offline       |');
    });
    client.on('close', () => {
        console.log('| closed        |');
    });
    client.on('end', () => {
        console.log('| ended         |');
    });
};
