import {createServer, Server} from 'aedes-server-factory';
import {AsyncMqttClient} from 'async-mqtt';

import {MqttConnection} from '../../src/types/Mqtt';

export const createServerAsync = ({
    password,
    port,
    username,
}: MqttConnection): Promise<Server> =>
    new Promise((resolve: (server: Server) => void): void  => {
        const aedes = require('aedes')();
        const server = createServer(aedes);
        server.listen(port, () => {
            if (username && password) {
                aedes.authenticate = (client: {}, actualUsername: string, actualPassword: string,
                                      callback: (error: null, authenticated: boolean) => void): void => {
                    const authenticated = actualUsername === username && actualPassword.toString() === password;
                    callback(null, authenticated);
                };
            }
            resolve(server);
        });
        server.on('close', () => {
            aedes.close();
        });
    });

export const onMessageAsync = (client: AsyncMqttClient): Promise<{ payload: string; topic: string }> =>
    new Promise((resolve: (obj: {payload: string; topic: string}) => void) => {
        client.on('message', (topic: string, payloadBuffer: Buffer) => {
            resolve({
                payload: payloadBuffer.toString(),
                topic,
            });
        });
    });
