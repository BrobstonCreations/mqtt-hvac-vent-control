const aedes = require('aedes')();
import {createServer, Server} from 'aedes-server-factory';

import Mqtt from '../../src/types/Mqtt';

export const createServerAsync = ({
    password,
    port,
    username,
}: Mqtt): Promise<Server> => {
    return new Promise((resolve: (server: Server) => void): void  => {
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
    });
};
