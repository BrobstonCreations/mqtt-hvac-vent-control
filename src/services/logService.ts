import {AsyncMqttClient, Packet} from 'async-mqtt';

export const setupLogging = (client: AsyncMqttClient): void => {
    client.on('connect', (connack: any) => {
        console.log(`Connected! connack: ${JSON.stringify(connack)}`);
    });
    client.on('reconnect', () => {
        console.log('Reconnected!');
    });
    client.on('disconnect', () => {
        console.log('Disconnected!');
    });
    client.on('message', (topic: string, message: string, packet: Packet) => {
        console.log(`Message sent! topic: ${topic}, message: ${message}, packet: ${JSON.stringify(packet)}`);
    });
    client.on('packetsend', (packet: Packet) => {
        console.log(`Packet sent! packet: ${JSON.stringify(packet)}`);
    });
    client.on('packetreceive', (packet: Packet) => {
        console.log(`Packet received! packet: ${JSON.stringify(packet)}`);
    });
    client.on('error', (error: Error) => {
        console.log(`Error! error: ${error}`);
    });
    client.on('offline', () => {
        console.log('Offline!');
    });
    client.on('close', () => {
        console.log('Close!');
    });
    client.on('end', () => {
        console.log('End!');
    });
};
