import {AsyncMqttClient} from 'async-mqtt';
import {House, Room, Vent} from '../types/Mqtt';
import {isMode} from './houseService';
import {allRoomsAreAtDesiredTemperature} from './roomService';

export const adjustVents = async (
    house: House,
    messages: {[key: string]: string},
    client: AsyncMqttClient,
): Promise<void> => {
    if (isMode(messages, house.modeNighttimePayload, house.modeStateTopic)) {
        await adjustVentsToNighttimeState(house.rooms, messages, client);
    } else if (allRoomsAreAtDesiredTemperature(house, messages)) {
        await adjustVentsToIdleState(house.rooms, messages, client);
    } else {
        await adjustVentsByTemperature(house, messages, client);
    }
};

export const adjustVentsToNighttimeState = async (
    rooms: Room[],
    messages: {[key: string]: string},
    client: AsyncMqttClient,
): Promise<void> => {
    await Promise.all(
        rooms.map(({isNighttimeRoom, vents}: Room) =>
            vents.map(({positionCommandTopic, openPositionPayload, closePositionPayload}: Vent) =>
                client.publish(positionCommandTopic,
                    isNighttimeRoom ? openPositionPayload : closePositionPayload))).flat());
};

export const adjustVentsToIdleState = async (
  rooms: Room[],
  messages: {[key: string]: string},
  client: AsyncMqttClient,
): Promise<void> => {
    await Promise.all(
        rooms.map(({vents}: Room) => {
            vents.map(({
                closedWhenIdle,
                closePositionPayload,
                openPositionPayload,
                positionCommandTopic,
            }: Vent) =>
                client.publish(positionCommandTopic,
                    closedWhenIdle ? closePositionPayload : openPositionPayload));
        }),
    );
};

export const openAllVents = async (
    vents: Vent[],
    messages: {[key: string]: string},
    client: AsyncMqttClient,
): Promise<void> => {
    await Promise.all(vents.map((vent: Vent) => client.publish(vent.positionCommandTopic, vent.openPositionPayload)));
};

export const adjustVentsByTemperature = async (
    house: House,
    messages: {[key: string]: string},
    client: AsyncMqttClient,
): Promise<void> => {
    await Promise.all(house.rooms.map((room: Room) =>
        room.vents.map((vent: Vent) => {
            const roomActualTemperature = messages[room.actualTemperatureStateTopic];
            const roomTargetTemperature = messages[room.targetTemperatureStateTopic];
            if (roomActualTemperature && roomTargetTemperature) {
                const ventPosition = messages[vent.positionStateTopic];
                const ventPositionPayload = determineVentPositionPayload(house, room, vent, messages);
                const currentVentPosition = getVentPositionPayload(ventPosition, vent);
                if (!ventPosition || ventPositionPayload !== 'null' && ventPositionPayload !== currentVentPosition) {
                    return client.publish(vent.positionCommandTopic, ventPositionPayload);
                }
            }
        }),
    ).flat());
};

export const getVentPositionPayload = (
    ventState: string,
    {openPositionPayload, openedStatePayload, closePositionPayload, closedStatePayload}: Vent,
): string|void => {
    switch (ventState) {
        case openedStatePayload:
            return openPositionPayload;
        case closedStatePayload:
            return closePositionPayload;
    }
};

const determineVentPositionPayload = (
    {thermostat: {modeStateTopic, heatModePayload, coolModePayload}}: House,
    {actualTemperatureStateTopic, targetTemperatureStateTopic}: Room,
    {closePositionPayload, openPositionPayload}: Vent,
    messages: {[key: string]: string},
): string => {
    const thermostatMode = messages[modeStateTopic];
    const roomActualTemperature = messages[actualTemperatureStateTopic];
    const roomTargetTemperature = messages[targetTemperatureStateTopic];
    switch (thermostatMode) {
        case heatModePayload:
            return roomTargetTemperature <= roomActualTemperature ? closePositionPayload : openPositionPayload;
        case coolModePayload:
            return roomActualTemperature <= roomTargetTemperature ? closePositionPayload : openPositionPayload;
    }
    return 'null';
};
