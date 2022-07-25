import {AsyncMqttClient} from 'async-mqtt';

import {House, Room, Vent} from '../types/Mqtt';
import {isMode} from './houseService';

export const adjustRooms = async (
    {thermostat: {modeStateTopic, heatModePayload, coolModePayload}, rooms}: House,
    messages: {[key: string]: string},
    client: AsyncMqttClient,
): Promise<void> => {
    await Promise.all(rooms.map((room: Room) => {
        const roomActualTemperature = messages[room.actualTemperatureStateTopic];
        const roomTargetTemperature = messages[room.targetTemperatureStateTopic];
        if (roomActualTemperature && roomTargetTemperature) {
            const thermostatMode = messages[modeStateTopic];
            if (thermostatMode === heatModePayload && roomActualTemperature < roomTargetTemperature) {
                return client.publish(room.modeCommandTopic, 'heat');
            } else if (thermostatMode === coolModePayload && roomTargetTemperature < roomActualTemperature) {
                return client.publish(room.modeCommandTopic, 'cool');
            }
            return client.publish(room.modeCommandTopic, 'off');
        }
    }));
};

export const allRoomsAreAtDesiredTemperature = (
    house: House,
    messages: {[key: string]: string},
): any => {
    const {thermostat: {modeStateTopic, coolModePayload, heatModePayload}}: House = house;
    const thermostatMode = messages[modeStateTopic];
    return determineRooms(house, messages).every((room: Room) => {
        const roomActualTemperature = messages[room.actualTemperatureStateTopic];
        const roomTargetTemperature = messages[room.targetTemperatureStateTopic];

        switch (thermostatMode) {
            case coolModePayload:
                return roomActualTemperature <= roomTargetTemperature;
            case heatModePayload:
                return roomActualTemperature >= roomTargetTemperature;
        }
    });
};

export const getAllVents = (rooms: Room[]): Vent[] =>
    rooms.reduce((accumulator: Vent[], room: Room) => [
        ...accumulator,
        ...room.vents,
    ], []);

export const getAllOpenWhenIdleVents = (rooms: Room[]): Vent[] =>
    rooms.reduce((roomsAccumulator: Vent[], room: Room) => [
        ...roomsAccumulator,
        ...(room.vents.reduce((ventsAccumulator: Vent[], vent: Vent) =>
            !vent.closedWhenIdle ? [
                ...ventsAccumulator,
                vent,
            ] : ventsAccumulator, [])
        ),
    ], []);

export const getAllNighttimeVents = (rooms: Room[]): Vent[] => {
    const bedrooms = getAllNighttimeRooms(rooms);
    return getAllVents(bedrooms);
};

export const getAllNighttimeRooms = (rooms: Room[]): Room[] =>
    rooms.reduce((accumulator: Room[], room: Room): Room[] =>
        room.isNighttimeRoom ? [
            ...accumulator,
            room,
        ] : accumulator, []);

const determineRooms = (
    {modeNighttimePayload, modeStateTopic, rooms}: House,
    messages: {[key: string]: string},
): Room[] =>
    isMode(messages, modeNighttimePayload, modeStateTopic) ? getAllNighttimeRooms(rooms) : rooms;
