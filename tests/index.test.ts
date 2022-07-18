import {Server} from 'aedes-server-factory';

import {AsyncMqttClient, connectAsync} from 'async-mqtt';
import {Chance} from 'chance';
import {closeSync, openSync, unlinkSync, writeFileSync} from 'fs';

import {MqttConnection} from '../src/types/Mqtt';

import {start, stop} from '../src';
import {SYSTEM_NAME} from '../src/constants/system';
import {createServerAsync, onMessageAsync} from './utils/asyncHelper';

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
        closePositionPayload: 'close',
        closedStatePayload: 'closed',
        name: chance.word(),
        openPositionPayload: 'open',
        openedStatePayload: 'opened',
        positionCommandTopic: 'cmd/room_south/vent',
        positionStateTopic: 'stat/room_south/vent',
    };
    const room1 = {
        actualTemperatureStateTopic: 'stat/room1/actual_temperature',
        name: chance.word(),
        targetTemperatureStateTopic: 'stat/room1/target_temperature',
        vents: [vent],
    };
    const room2 = {
        actualTemperatureStateTopic: 'stat/room2/actual_temperature',
        name: chance.word(),
        targetTemperatureStateTopic: 'stat/room2/target_temperature',
        vents: [vent],
    };
    const thermostat = {
        actionStateTopic: 'stat/ecobee/action',
        actualTemperatureStateTopic: 'stat/ecobee/actual_temperature',
        coolModePayload: 'cool',
        coolingActionPayload: 'cooling',
        heatModePayload: 'heat',
        heatingActionPayload: 'heating',
        idleActionPayload: 'idle',
        modeStateTopic: 'stat/ecobee/mode',
        name: chance.word(),
        offModePayload: 'off',
        targetTemperatureCommandTopic: 'cmd/ecobee/temperature',
        targetTemperatureStateTopic: 'stat/ecobee/target_temperature',
    };
    const house = {
        rooms: [room1, room2],
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
            actualRoom1Temperature: '72',
            actualRoom2Temperature: '75',
            expectedVentPositionPayload: vent.openPositionPayload,
            name: 'should open vent if thermostat is in heat mode and actual room1 temperature is less than target room1 temperature',
            targetRoom1Temperature: '73',
            targetRoom2Temperature: '76',
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoom1Temperature: '72',
            actualRoom2Temperature: '76',
            expectedVentPositionPayload: vent.openPositionPayload,
            name: 'should open vent if thermostat is in cool mode and actual room1 temperature is greater than target room1 temperature',
            targetRoom1Temperature: '71',
            targetRoom2Temperature: '75',
            thermostatMode: thermostat.coolModePayload,
        },
        {
            actualRoom1Temperature: '72',
            actualRoom2Temperature: '75',
            expectedVentPositionPayload: vent.closePositionPayload,
            name: 'should close vent if thermostat is in heat mode and actual room1 temperature is greater than target room1 temperature',
            targetRoom1Temperature: '71',
            targetRoom2Temperature: '76',
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoom1Temperature: '72',
            actualRoom2Temperature: '75',
            expectedVentPositionPayload: vent.closePositionPayload,
            name: 'should close vent if thermostat is in cool mode and actual room temperature is less than target room temperature',
            targetRoom1Temperature: '73',
            targetRoom2Temperature: '76',
            thermostatMode: thermostat.coolModePayload,
        },
        {
            actualRoom1Temperature: '72',
            actualRoom2Temperature: '75',
            expectedVentPositionPayload: vent.closePositionPayload,
            name: 'should close vent if thermostat is in heat mode and actual room temperature is equal to target room temperature',
            targetRoom1Temperature: '72',
            targetRoom2Temperature: '76',
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoom1Temperature: '72',
            actualRoom2Temperature: '75',
            expectedVentPositionPayload: vent.closePositionPayload,
            name: 'should close vent if thermostat is in cool mode and actual room temperature is equal to target room temperature',
            targetRoom1Temperature: '72',
            targetRoom2Temperature: '76',
            thermostatMode: thermostat.coolModePayload,
        },
    ])('$name', async ({
        actualRoom1Temperature,
        actualRoom2Temperature,
        targetRoom1Temperature,
        targetRoom2Temperature,
        expectedVentPositionPayload,
        thermostatMode,
    }: any) => {
        await client.subscribe(vent.positionCommandTopic);
        const options = {
            house,
            log: false,
            mqttConnection,
        };
        writeFileSync(optionsFilePath, JSON.stringify(options));
        process.env.OPTIONS_FILE_PATH = optionsFilePath;

        await start();

        await client.publish(thermostat.modeStateTopic, thermostatMode);
        await client.publish(room1.targetTemperatureStateTopic, targetRoom1Temperature.toString());
        await client.publish(room1.actualTemperatureStateTopic, actualRoom1Temperature.toString());
        await client.publish(room2.actualTemperatureStateTopic, actualRoom2Temperature.toString());
        await client.publish(room2.targetTemperatureStateTopic, targetRoom2Temperature.toString());
        const actualPayload = await onMessageAsync(vent.positionCommandTopic, client);
        expect(actualPayload).toEqual(expectedVentPositionPayload);
    });

    it.each([
        {
            actualRoomTemperature: '72',
            actualThermostatTemperature: '72',
            expectedThermostatTemperaturePayload: '73',
            name: 'should begin heating if thermostat is idle, in heat mode, and at least one room\'s actual room temperature is less than target room temperature',
            targetRoomTemperature: '73',
            targetThermostatTemperature: '72',
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoomTemperature: '72',
            actualThermostatTemperature: '72',
            expectedThermostatTemperaturePayload: '71',
            name: 'should begin cooling if thermostat is idle, in cool mode, and at least one room\'s actual room temperature is greater than target room temperature',
            targetRoomTemperature: '71',
            targetThermostatTemperature: '72',
            thermostatMode: thermostat.coolModePayload,
        },
        {
            actualRoomTemperature: '72',
            actualThermostatTemperature: '72',
            expectedThermostatTemperaturePayload: '73',
            name: 'should continue heating if thermostat is idle, in heat mode, and at least one room\'s actual room temperature is still less than target room temperature',
            targetRoomTemperature: '73',
            targetThermostatTemperature: '73',
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoomTemperature: '72',
            actualThermostatTemperature: '72',
            expectedThermostatTemperaturePayload: '71',
            name: 'should continue cooling if thermostat is idle, in cool mode, and at least one room\'s actual room temperature is still greater than target room temperature',
            targetRoomTemperature: '71',
            targetThermostatTemperature: '71',
            thermostatMode: thermostat.coolModePayload,
        },
    ])('$name', async ({
        actualRoomTemperature,
        actualThermostatTemperature,
        targetRoomTemperature,
        targetThermostatTemperature,
        expectedThermostatTemperaturePayload,
        thermostatMode,
    }: any) => {
        await client.subscribe(thermostat.targetTemperatureCommandTopic);
        const options = {
            house,
            log: false,
            mqttConnection,
        };
        writeFileSync(optionsFilePath, JSON.stringify(options));
        process.env.OPTIONS_FILE_PATH = optionsFilePath;

        await start();

        await client.publish(thermostat.modeStateTopic, thermostatMode);
        await client.publish(thermostat.actionStateTopic, thermostat.idleActionPayload);
        await client.publish(thermostat.actualTemperatureStateTopic, actualThermostatTemperature.toString());
        await client.publish(thermostat.targetTemperatureStateTopic, targetThermostatTemperature.toString());
        await client.publish(room1.actualTemperatureStateTopic, actualRoomTemperature.toString());
        await client.publish(room1.targetTemperatureStateTopic, targetRoomTemperature.toString());
        const actualPayload = await onMessageAsync(thermostat.targetTemperatureCommandTopic, client);
        expect(actualPayload).toEqual(expectedThermostatTemperaturePayload.toString());
    });

    it('should not adjust vents or thermostat if system is off', async () => {
        await client.subscribe(`stat/${SYSTEM_NAME}/pause`);

        await start({
            house,
            log: false,
            mqttConnection,
        });

        await client.publish(`cmd/${SYSTEM_NAME}/pause`, 'true');
        const actualPayload = await onMessageAsync(`stat/${SYSTEM_NAME}/pause`, client);
        expect(actualPayload).toBe('true');
    });

    it('should invoke logging', async () => {
        await start({
            house,
            log: true,
            mqttConnection,
        });

        await client.publish(thermostat.modeStateTopic, thermostat.heatModePayload);
    });
});
