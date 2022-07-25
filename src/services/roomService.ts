import {AsyncMqttClient} from 'async-mqtt';

import {House, Room, Vent} from '../types/Mqtt';

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

export const allRoomsAreAtDesiredTemperature = (house: House, messages: {[key: string]: string|number}): any => {
    const thermostatMode = messages[house.thermostat.modeStateTopic];
    return house.rooms.every((room: Room) => {
        const roomActualTemperature = messages[room.actualTemperatureStateTopic];
        const roomTargetTemperature = messages[room.targetTemperatureStateTopic];

        switch (thermostatMode) {
            case house.thermostat.coolModePayload:
                return roomActualTemperature <= roomTargetTemperature;
            case house.thermostat.heatModePayload:
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
