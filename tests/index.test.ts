import {Server} from 'aedes-server-factory';

import {createServerAsync} from './utils/aedesHelper';

import {AsyncMqttClient, connectAsync} from 'async-mqtt';
import {Chance} from 'chance';
import {closeSync, openSync, unlinkSync} from 'fs';

import {MqttConnection} from '../src/types/Mqtt';

import {start, stop} from '../src';
import {message} from './utils/asyncHelper';

const chance = new Chance();

describe('index', () => {
    const optionsFilePath = `${__dirname}/options.json`;
    const mqttConnection = {
        host: 'localhost',
        password: chance.string(),
        port: 1883,
        username: chance.string(),
    };
    const vent = {
        closePositionPayload: chance.word(),
        closedStatePayload: chance.word(),
        name: chance.word(),
        openPositionPayload: chance.word(),
        openedStatePayload: chance.word(),
        positionCommandTopic: chance.word(),
        positionStateTopic: chance.word(),
    };
    const room = {
        actualTemperatureStateTopic: chance.word(),
        name: chance.word(),
        targetTemperatureCommandTopic: chance.word(),
        targetTemperatureStateTopic: chance.word(),
        vents: [vent],
    };
    const thermostat = {
        actualTemperatureStateTopic: chance.word(),
        coolModePayload: chance.word(),
        heatModePayload: chance.word(),
        modeStateTopic: chance.word(),
        name: chance.word(),
        offModePayload: chance.word(),
        targetTemperatureCommandTopic: chance.word(),
        targetTemperatureStateTopic: chance.word(),
    };
    const house = {
        rooms: [room],
        thermostat,
    };

    let server: Server,
        client: AsyncMqttClient;

    beforeEach(async () => {
        server = await createServerAsync(mqttConnection);
        const {host, username, password, port}: MqttConnection = mqttConnection;
        client = await connectAsync(`tcp://${host}:${port}`, {username, password});
        closeSync(openSync(optionsFilePath, 'w'));
    });

    afterEach(async () => {
        unlinkSync(optionsFilePath);
        server.close();
        process.env.OPTIONS = undefined;
        await client.end();
        await stop();
    });

    it.each([
        {
            actualRoomTemperature: 72,
            expectedVentPositionPayload: vent.openPositionPayload,
            name: 'should open vent if thermostat is in heat mode and actual room temperature is less than target room temperature',
            targetRoomTemperature: 73,
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoomTemperature: 72,
            expectedVentPositionPayload: vent.openPositionPayload,
            name: 'should open vent if thermostat is in cool mode and actual room temperature is greater than target room temperature',
            targetRoomTemperature: 71,
            thermostatMode: thermostat.coolModePayload,
        },
        {
            actualRoomTemperature: 72,
            expectedVentPositionPayload: vent.closePositionPayload,
            name: 'should close vent if thermostat is in heat mode and actual room temperature is greater than target room temperature',
            targetRoomTemperature: 71,
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoomTemperature: 72,
            expectedVentPositionPayload: vent.closePositionPayload,
            name: 'should close vent if thermostat is in cool mode and actual room temperature is less than target room temperature',
            targetRoomTemperature: 73,
            thermostatMode: thermostat.coolModePayload,
        },
        {
            actualRoomTemperature: 72,
            expectedVentPositionPayload: vent.closePositionPayload,
            name: 'should close vent if thermostat is in heat mode and actual room temperature is equal to target room temperature',
            targetRoomTemperature: 72,
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoomTemperature: 72,
            expectedVentPositionPayload: vent.closePositionPayload,
            name: 'should close vent if thermostat is in cool mode and actual room temperature is equal to target room temperature',
            targetRoomTemperature: 72,
            thermostatMode: thermostat.coolModePayload,
        },
    ])('$name', async ({
        actualRoomTemperature,
        targetRoomTemperature,
        expectedVentPositionPayload,
        thermostatMode,
    }: any) => {
        await client.subscribe(vent.positionCommandTopic);

        await start({
            house,
            log: false,
            mqttConnection,
        });

        await client.publish(thermostat.modeStateTopic, thermostatMode);
        await client.publish(room.actualTemperatureStateTopic, actualRoomTemperature.toString());
        await client.publish(room.targetTemperatureStateTopic, targetRoomTemperature.toString());
        const expectedMessage = await message(client);
        expect({
            payload: expectedVentPositionPayload,
            topic: vent.positionCommandTopic,
        }).toEqual(expectedMessage);
    });
});
