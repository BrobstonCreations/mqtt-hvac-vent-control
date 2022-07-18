import {AsyncMqttClient, IPublishPacket} from 'async-mqtt';
import {SYSTEM_NAME} from '../constants/system';
import {House, Room, Vent} from '../types/Mqtt';
import {allRoomsAreAtDesiredTemperature, getAllVents} from './roomService';

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
                const thermostatMode = messages[house.thermostat.modeStateTopic];
                const ventPosition = messages[vent.positionStateTopic];
                if (thermostatMode === house.thermostat.heatModePayload) {
                    const ventPositionPayload = roomTargetTemperature <= roomActualTemperature ?
                        vent.closePositionPayload : vent.openPositionPayload;
                    if (!ventPosition || !ventPosition.startsWith(ventPositionPayload)) {
                        return client.publish(vent.positionCommandTopic, ventPositionPayload);
                    }
                } else if (thermostatMode === house.thermostat.coolModePayload) {
                    const ventPositionPayload = roomActualTemperature <= roomTargetTemperature ?
                        vent.closePositionPayload : vent.openPositionPayload;
                    if (!ventPosition || !ventPosition.startsWith(ventPositionPayload)) {
                        return client.publish(vent.positionCommandTopic, ventPositionPayload);
                    }
                }
            }
        }),
    ).flat());
};
