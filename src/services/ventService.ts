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
                const openedStatePayload = mapMemoryToTopic[`${ventMemory}.openedStatePayload`];
                const closePositionPayload = mapMemoryToTopic[`${ventMemory}.closePositionPayload`];
                const closedStatePayload = mapMemoryToTopic[`${ventMemory}.closedStatePayload`];
                if (thermostat.mode === thermostatHeatModePayload) {
                    const ventStatePayload = room.actualTemperature < room.targetTemperature ?
                        openedStatePayload : closedStatePayload;
                    if (!vent.position || vent.position && vent.position !== ventStatePayload) {
                        const ventPositionPayload = room.actualTemperature < room.targetTemperature ?
                            openPositionPayload : closePositionPayload;
                        await client.publish(ventPositionCommandTopic, ventPositionPayload);
                    }
                } else if (thermostat.mode === thermostatCoolModePayload) {
                    const ventStatePayload = room.actualTemperature < room.targetTemperature ?
                        closedStatePayload : openedStatePayload;
                    if (!vent.position || vent.position && vent.position !== ventStatePayload) {
                        const ventPositionPayload = room.actualTemperature <= room.targetTemperature ?
                            closePositionPayload : openPositionPayload;
                        await client.publish(ventPositionCommandTopic, ventPositionPayload);
                    }
                }
            }
        });
    });
};
