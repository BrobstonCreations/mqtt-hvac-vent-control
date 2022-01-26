import {AsyncMqttClient} from 'async-mqtt';

import {CLOSE, OPEN} from '../constants/Vent';
import * as State from '../types/State';
import {getMapMemoryToTopic} from './stateService';

export const act = ({thermostat, rooms}: State.House, client: AsyncMqttClient): void => {
    const mapMemoryToTopic = getMapMemoryToTopic();
    Object.keys(rooms).forEach((roomName: string) => {
        const room = rooms[roomName];
        Object.keys(room.vents).forEach((ventName: string) => {
            if (room.actualTemperature && room.targetTemperature) {
                const ventPositionCommandTopic = mapMemoryToTopic[`rooms.${roomName}.vents.${ventName}.positionCommandTopic`];
                const ventPositionPayload = room.actualTemperature < room.targetTemperature ? OPEN : CLOSE;
                client.publish(ventPositionCommandTopic, ventPositionPayload.toString());
                const thermostatTargetTemperatureCommandTopic = mapMemoryToTopic['thermostat.targetTemperatureCommandTopic'];
                if (thermostat.actualTemperature
                    && thermostat.targetTemperature
                    && thermostat.actualTemperature === thermostat.targetTemperature) {
                    const message = thermostat.actualTemperature + 1;
                    client.publish(thermostatTargetTemperatureCommandTopic, message.toString());
                }
            }
        });
    });
};
