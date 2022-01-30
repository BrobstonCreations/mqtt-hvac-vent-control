import {AsyncMqttClient} from 'async-mqtt';
import * as State from '../types/State';
import {getMapMemoryToTopic} from './stateService';

export const adjustVents = async ({thermostat, rooms}: State.House, client: AsyncMqttClient): Promise<void> => {
    const mapMemoryToTopic = getMapMemoryToTopic();
    const thermostatCoolModePayload = mapMemoryToTopic['thermostat.coolModePayload'];
    const thermostatHeatModePayload = mapMemoryToTopic['thermostat.heatModePayload'];
    Object.keys(rooms).forEach((roomName: string) => {
        const room = rooms[roomName];
        Object.keys(room.vents).forEach(async (ventName: string) => {
            if (room.actualTemperature && room.targetTemperature) {
                const vent = room.vents[ventName];
                const ventMemory = `rooms.${roomName}.vents.${ventName}`;
                const ventPositionCommandTopic = mapMemoryToTopic[`${ventMemory}.positionCommandTopic`];
                const openPositionPayload = mapMemoryToTopic[`${ventMemory}.openPositionPayload`];
                const closePositionPayload = mapMemoryToTopic[`${ventMemory}.closePositionPayload`];
                if (thermostat.mode === thermostatHeatModePayload) {
                    const ventPositionPayload = room.actualTemperature < room.targetTemperature ?
                        openPositionPayload : closePositionPayload;
                    if (!vent.position || vent.position && vent.position !== ventPositionPayload) {
                        await client.publish(ventPositionCommandTopic, ventPositionPayload);
                    }
                } else if (thermostat.mode === thermostatCoolModePayload) {
                    const ventPositionPayload = room.actualTemperature <= room.targetTemperature ?
                        closePositionPayload : openPositionPayload;
                    if (!vent.position || vent.position && vent.position !== ventPositionPayload) {
                        await client.publish(ventPositionCommandTopic, ventPositionPayload);
                    }
                }
            }
        });
    });
};