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

export const onMessageAsync = (topic: string, client: AsyncMqttClient): Promise<string> =>
    new Promise((resolve: (payload: string) => void): void => {
        client.on('message', (actualTopic: string, payloadBuffer: Buffer) => {
            if (topic === actualTopic) {
                resolve(payloadBuffer.toString());
            }
        });
    });
