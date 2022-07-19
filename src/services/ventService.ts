import {AsyncMqttClient, IPublishPacket} from 'async-mqtt';
import {SYSTEM_NAME} from '../constants/system';
import {House, Room, Vent} from '../types/Mqtt';
import {allRoomsAreAtDesiredTemperature, getAllVents} from './roomService';
import any = jasmine.any;

export const adjustVents = async (
    house: House,
    messages: {[key: string]: string},
    client: AsyncMqttClient,
): Promise<void> => {
    if (messages[`cmd/${SYSTEM_NAME}/pause`] !== 'true') {
        if (allRoomsAreAtDesiredTemperature(house, messages)) {
            const vents = getAllVents(house.rooms);
            await openAllVents(vents, messages, client);
        } else {
            await adjustRoomsVents(house, messages, client);
        }
    }
};

export const openAllVents = async (
    vents: Vent[],
    messages: {[key: string]: string},
    client: AsyncMqttClient,
): Promise<void> => {
    await Promise.all(
        vents.reduce((accumulator: any, vent: Vent) => {
            if (messages[vent.positionStateTopic] === vent.closedStatePayload && !vent.closedWhenIdle) {
                return [
                    ...accumulator,
                    client.publish(vent.positionCommandTopic, vent.openPositionPayload),
                ];
            }
            return [...accumulator];
        }, []),
    );
};

export const adjustRoomsVents = async (
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
                console.log(vent);
                console.log(messages);
                if (!ventPosition || ventPositionPayload !== 'null' && !ventPosition.startsWith(ventPositionPayload)) {
                    return client.publish(vent.positionCommandTopic, ventPositionPayload);
                }
            }
        }),
    ).flat());
};

export const getVentStatePayload = (
    ventPositionPayload: string,
    {openPositionPayload, openedStatePayload, closePositionPayload, closedStatePayload}: Vent,
): string|void => {
    switch (ventPositionPayload) {
        case openPositionPayload:
            return openedStatePayload;
        case closePositionPayload:
            return closedStatePayload;
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
