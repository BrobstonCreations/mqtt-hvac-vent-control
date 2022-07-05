import {Server} from 'aedes-server-factory';

import {AsyncMqttClient, connectAsync} from 'async-mqtt';
import {Chance} from 'chance';
import {closeSync, openSync, unlinkSync} from 'fs';

import {MqttConnection} from '../src/types/Mqtt';

import {start, stop} from '../src';
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
    const room = {
        actualTemperatureStateTopic: 'stat/room/actual_temperature',
        name: chance.word(),
        targetTemperatureStateTopic: 'stat/room/target_temperature',
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

        await client.publish(room.actualTemperatureStateTopic, actualRoomTemperature.toString());
        await client.publish(room.targetTemperatureStateTopic, targetRoomTemperature.toString());
        await client.publish(thermostat.modeStateTopic, thermostatMode);
        const actualPayload = await onMessageAsync(vent.positionCommandTopic, client);
        expect(actualPayload).toEqual(expectedVentPositionPayload);
    });

    it.each([
        {
            actualRoomTemperature: 72,
            actualThermostatTemperature: 72,
            expectedThermostatTemperaturePayload: 73,
            name: 'should begin heating if thermostat is idle, in heat mode, and at least one room\'s actual room temperature is less than target room temperature',
            targetRoomTemperature: 73,
            targetThermostatTemperature: 72,
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoomTemperature: 72,
            actualThermostatTemperature: 72,
            expectedThermostatTemperaturePayload: 71,
            name: 'should begin cooling if thermostat is idle, in cool mode, and at least one room\'s actual room temperature is greater than target room temperature',
            targetRoomTemperature: 71,
            targetThermostatTemperature: 72,
            thermostatMode: thermostat.coolModePayload,
        },
        {
            actualRoomTemperature: 72,
            actualThermostatTemperature: 72,
            expectedThermostatTemperaturePayload: 73,
            name: 'should continue heating if thermostat is idle, in heat mode, and at least one room\'s actual room temperature is still less than target room temperature',
            targetRoomTemperature: 73,
            targetThermostatTemperature: 73,
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoomTemperature: 72,
            actualThermostatTemperature: 72,
            expectedThermostatTemperaturePayload: 71,
            name: 'should continue cooling if thermostat is idle, in cool mode, and at least one room\'s actual room temperature is still greater than target room temperature',
            targetRoomTemperature: 71,
            targetThermostatTemperature: 71,
            thermostatMode: thermostat.coolModePayload,
        },
        {
            actualRoomTemperature: 73,
            actualThermostatTemperature: 72,
            expectedThermostatTemperaturePayload: 72,
            name: 'should become idle if thermostat is idle, in heat mode, and all room\'s actual room temperature is greater than target room temperature',
            targetRoomTemperature: 72,
            targetThermostatTemperature: 73,
            thermostatMode: thermostat.heatModePayload,
        },
        {
            actualRoomTemperature: 71,
            actualThermostatTemperature: 72,
            expectedThermostatTemperaturePayload: 72,
            name: 'should become idle if thermostat is idle, in cool mode, and all room\'s actual room temperature is less than target room temperature',
            targetRoomTemperature: 72,
            targetThermostatTemperature: 71,
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

        await start({
            house,
            log: false,
            mqttConnection,
        });

        await client.publish(thermostat.modeStateTopic, thermostatMode);
        await client.publish(thermostat.actionStateTopic, thermostat.idleActionPayload);
        await client.publish(thermostat.actualTemperatureStateTopic, actualThermostatTemperature.toString());
        await client.publish(thermostat.targetTemperatureStateTopic, targetThermostatTemperature.toString());
        await client.publish(room.actualTemperatureStateTopic, actualRoomTemperature.toString());
        await client.publish(room.targetTemperatureStateTopic, targetRoomTemperature.toString());
        const actualPayload = await onMessageAsync(thermostat.targetTemperatureCommandTopic, client);
        expect(actualPayload).toEqual(expectedThermostatTemperaturePayload.toString());
    });
});
