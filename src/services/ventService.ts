import {AsyncMqttClient} from 'async-mqtt';
import {House, Room, Vent} from '../types/Mqtt';

export const adjustVents =
    async (house: House, messages: {[key: string]: string|number}, client: AsyncMqttClient): Promise<void> => {
    const {rooms, thermostat}: House = house;
    const thermostatCoolModePayload = thermostat.coolModePayload;
    const thermostatHeatModePayload = thermostat.heatModePayload;
    rooms.forEach((room: Room) => {
        room.vents.forEach((vent: Vent) => {
            const actualTemperature = messages[room.actualTemperatureStateTopic];
            const targetTemperature = messages[room.targetTemperatureStateTopic];
            if (actualTemperature && targetTemperature) {
                const thermostatMode = messages[thermostat.modeStateTopic];
                const ventPosition = messages[vent.positionStateTopic];
                if (thermostatMode === thermostatHeatModePayload) {
                    const ventStatePayload = actualTemperature < targetTemperature ?
                        vent.openedStatePayload : vent.closedStatePayload;
                    if (!ventPosition || ventPosition && ventPosition !== ventStatePayload) {
                        const ventPositionPayload = actualTemperature < targetTemperature ?
                            vent.openPositionPayload : vent.closePositionPayload;
                        client.publish(vent.positionCommandTopic, ventPositionPayload);
                    }
                } else if (thermostatMode === thermostatCoolModePayload) {
                    const ventStatePayload = actualTemperature < targetTemperature ?
                        vent.closedStatePayload : vent.openedStatePayload;
                    if (!ventPosition || ventPosition && ventPosition !== ventStatePayload) {
                        const ventPositionPayload = actualTemperature <= targetTemperature ?
                            vent.closePositionPayload : vent.openPositionPayload;
                        client.publish(vent.positionCommandTopic, ventPositionPayload);
                    }
                }
            }
        });
    });
};
