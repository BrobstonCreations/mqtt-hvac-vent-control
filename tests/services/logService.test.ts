import {AsyncMqttClient} from 'async-mqtt';

import {setupLogging} from '../../src/services/logService';

global.console.log = jest.fn();

describe('log service', () => {
    let client: AsyncMqttClient;

    beforeEach(() => {
        client = {} as AsyncMqttClient;
        client.on = jest.fn().mockImplementation((event: string, callback: (a: any, b: any, c: any) => void) => {
            callback('param1', 'param2', 'param3');
        });

        setupLogging(client);
    });

    it('should call client on x times', () => {
        expect(client.on).toHaveBeenCalledTimes(8);
    });

    it('should call console log x times', () => {
        expect(global.console.log).toHaveBeenCalledTimes(16);
    });

    it('should call on connect', () => {
        expect(client.on).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(global.console.log).toHaveBeenCalledWith('connected    | connack: \"param1\"');
    });

    it('should call on reconnect', () => {
        expect(client.on).toHaveBeenCalledWith('reconnect', expect.any(Function));
        expect(global.console.log).toHaveBeenCalledWith('reconnected  |');
    });

    it('should call on disconnect', () => {
        expect(client.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
        expect(global.console.log).toHaveBeenCalledWith('disconnected |');
    });

    it('should call on message', () => {
        expect(client.on).toHaveBeenCalledWith('message', expect.any(Function));
        expect(global.console.log).toHaveBeenCalledWith('message      | topic: param1 | message: param2');
    });

    it('should call on error', () => {
        expect(client.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(global.console.log).toHaveBeenCalledWith('error        | param1');
    });

    it('should call on offline', () => {
        expect(client.on).toHaveBeenCalledWith('offline', expect.any(Function));
        expect(global.console.log).toHaveBeenCalledWith('offline      |');
    });

    it('should call on close', () => {
        expect(client.on).toHaveBeenCalledWith('close', expect.any(Function));
        expect(global.console.log).toHaveBeenCalledWith('closed       |');
    });

    it('should call on end', () => {
        expect(client.on).toHaveBeenCalledWith('end', expect.any(Function));
        expect(global.console.log).toHaveBeenCalledWith('ended        |');

    });
});
