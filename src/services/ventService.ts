import {AsyncMqttClient} from 'async-mqtt';
import {SYSTEM_NAME} from '../constants/system';
import {House, Room, Vent} from '../types/Mqtt';
import {allRoomsAreAtDesiredTemperature, getAllVents} from './roomService';

export const adjustVents = async (
    house: House,
    messages: {[key: string]: string|number},
    client: AsyncMqttClient,
): Promise<void> => {
    if (messages[`cmd/${SYSTEM_NAME}/pause`] !== 'true') {
        if (allRoomsAreAtDesiredTemperature(house, messages)) {
            const vents = getAllVents(house.rooms);
            await openAllVents(vents, messages, client);
        } else {
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
        }
    }
};

export const openAllVents = async (
    vents: Vent[],
    messages: {[key: string]: string|number},
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
