import {AsyncMqttClient} from 'async-mqtt';
import {House, Room, Vent} from '../types/Mqtt';

export const adjustVents = async (
    house: House,
    messages: {[key: string]: string|number},
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
                    const ventStatePayload = roomActualTemperature < roomTargetTemperature ?
                        vent.openedStatePayload : vent.closedStatePayload;
                    if (!ventPosition || ventPosition && ventPosition !== ventStatePayload) {
                        const ventPositionPayload = roomActualTemperature < roomTargetTemperature ?
                            vent.openPositionPayload : vent.closePositionPayload;
                        return client.publish(vent.positionCommandTopic, ventPositionPayload);
                    }
                } else if (thermostatMode === house.thermostat.coolModePayload) {
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
