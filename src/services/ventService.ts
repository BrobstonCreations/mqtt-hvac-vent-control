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
                const openedStatePayload = mapMemoryToTopic[`${ventMemory}.openedStatePayload`];
                const closedStatePayload = mapMemoryToTopic[`${ventMemory}.closedStatePayload`];
                if (thermostat.mode === thermostatHeatModePayload) {
                    const ventStatePayload = room.actualTemperature < room.targetTemperature ?
                        openedStatePayload : closedStatePayload;
                    if (!vent.position || vent.position && vent.position !== ventStatePayload) {
                        console.log(`vent position is not set or ${vent.position} !== ${ventStatePayload}`);
                        await client.publish(ventPositionCommandTopic, ventStatePayload);
                    }
                } else if (thermostat.mode === thermostatCoolModePayload) {
                    const ventPositionPayload = room.actualTemperature <= room.targetTemperature ?
                        closedStatePayload : openedStatePayload;
                    if (!vent.position || vent.position && vent.position !== ventPositionPayload) {
                        await client.publish(ventPositionCommandTopic, ventPositionPayload);
                    }
                }
            }
        });
    });
};