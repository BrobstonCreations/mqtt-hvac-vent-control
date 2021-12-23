import {Server} from 'mosca';

import Mqtt from '../../src/types/Mqtt';

export const createServerAsync = ({
    host,
    password,
    port,
    username,
}: Mqtt): Promise<Server> => {
    return new Promise((resolve: (server: Server) => void): void  => {
        const server = new Server({
            host,
            port,
        });
        server.on('ready', () => {
            if (username && password) {
                server.authenticate = (client: {}, actualUsername: string, actualPassword: string,
                                       callback: (error: null, authenticated: boolean) => void): void => {
                    const authenticated = actualUsername === username && actualPassword.toString() === password;
                    callback(null, authenticated);
                };
            }
            resolve(server);
        });
    });
};
