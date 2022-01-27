import {AsyncMqttClient} from 'async-mqtt';

import * as State from '../types/State';
import {getMapMemoryToTopic} from './stateService';

export const act = ({thermostat, rooms}: State.House, client: AsyncMqttClient): void => {
    const mapMemoryToTopic = getMapMemoryToTopic();
    const thermostatCoolModePayload = mapMemoryToTopic['thermostat.coolModePayload'];
    const thermostatHeatModePayload = mapMemoryToTopic['thermostat.heatModePayload'];
    Object.keys(rooms).forEach((roomName: string) => {
        const room = rooms[roomName];
        Object.keys(room.vents).forEach((ventName: string) => {
            if (room.actualTemperature && room.targetTemperature) {
                const vent = `rooms.${roomName}.vents.${ventName}`;
                const ventPositionCommandTopic = mapMemoryToTopic[`${vent}.positionCommandTopic`];
                const openPositionPayload = mapMemoryToTopic[`${vent}.openPositionPayload`];
                const closePositionPayload = mapMemoryToTopic[`${vent}.closePositionPayload`];
                if (thermostat.mode === thermostatHeatModePayload) {
                    const ventPositionPayload = room.actualTemperature < room.targetTemperature ?
                        openPositionPayload : closePositionPayload;
                    client.publish(ventPositionCommandTopic, ventPositionPayload);
                } else if (thermostat.mode === thermostatCoolModePayload) {
                    const ventPositionPayload = room.actualTemperature <= room.targetTemperature ?
                        closePositionPayload : openPositionPayload;
                    client.publish(ventPositionCommandTopic, ventPositionPayload);
                }
            }
        });
    });
};
