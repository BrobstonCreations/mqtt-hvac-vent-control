import {AsyncMqttClient} from 'async-mqtt';
import {House, Room, Vent} from '../types/Mqtt';

export const adjustVents =
    async (house: House, messages: {[key: string]: string|number}, client: AsyncMqttClient): Promise<void> => {
    const {rooms, thermostat}: House = house;
    const thermostatCoolModePayload = thermostat.coolModePayload;
    const thermostatHeatModePayload = thermostat.heatModePayload;
    await Promise.all(rooms.map((room: Room) =>
        room.vents.map((vent: Vent) => {
            const roomActualTemperature = messages[room.actualTemperatureStateTopic];
            const roomTargetTemperature = messages[room.targetTemperatureStateTopic];
            if (roomActualTemperature && roomTargetTemperature) {
                const thermostatMode = messages[thermostat.modeStateTopic];
                const ventPosition = messages[vent.positionStateTopic];
                if (thermostatMode === thermostatHeatModePayload) {
                    const ventStatePayload = roomActualTemperature < roomTargetTemperature ?
                        vent.openedStatePayload : vent.closedStatePayload;
                    if (!ventPosition || ventPosition && ventPosition !== ventStatePayload) {
                        const ventPositionPayload = roomActualTemperature < roomTargetTemperature ?
                            vent.openPositionPayload : vent.closePositionPayload;
                        return client.publish(vent.positionCommandTopic, ventPositionPayload);
                    }
                } else if (thermostatMode === thermostatCoolModePayload) {
                    const ventStatePayload = roomActualTemperature <= roomTargetTemperature ?
                        vent.closedStatePayload : vent.openedStatePayload;
                    if (!ventPosition || ventPosition && ventPosition !== ventStatePayload) {
                        const ventPositionPayload = roomActualTemperature <= roomTargetTemperature ?
                            vent.closePositionPayload : vent.openPositionPayload;
                        return client.publish(vent.positionCommandTopic, ventPositionPayload);
                    }
                }
            }
        }),
    ).flat());
};
