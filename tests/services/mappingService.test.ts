import {Chance} from 'chance';

import {House} from '../../src/types/Mqtt';

import {topicToMemory} from '../../src/services/mappingService';

const chance = new Chance();

describe('mappingService', () => {
    it('should create mapping object with mqtt topic to value', () => {
        const house = {
            rooms: [{
                actualTemperatureStateTopic: chance.word(),
                name: chance.word(),
                targetTemperatureStateTopic: chance.word(),
                vents: [{
                    closePositionPayload: chance.word(),
                    closedStatePayload: chance.word(),
                    name: chance.word(),
                    openPositionPayload: chance.word(),
                    openedStatePayload: chance.word(),
                    positionCommandTopic: chance.word(),
                    positionStateTopic: chance.word(),
                }],
            }],
            thermostat: {
                actionStateTopic: chance.word(),
                actualTemperatureStateTopic: chance.word(),
                coolModePayload: chance.word(),
                coolingActionPayload: chance.word(),
                heatModePayload: chance.word(),
                heatingActionPayload: chance.word(),
                idleActionPayload: chance.word(),
                modeStateTopic: chance.word(),
                name: chance.string(),
                targetTemperatureCommandTopic: chance.word(),
                targetTemperatureStateTopic: chance.word(),
            },
        } as House;

        const mappingObject = topicToMemory(house);

        const room = house.rooms[0];
        const vent = room.vents[0];
        expect(mappingObject).toEqual({
            [house.thermostat.actionStateTopic]: 'thermostat.actionStateTopic',
            [house.thermostat.actualTemperatureStateTopic]: 'thermostat.actualTemperatureStateTopic',
            [house.thermostat.coolModePayload]: 'thermostat.coolModePayload',
            [house.thermostat.coolingActionPayload]: 'thermostat.coolingActionPayload',
            [house.thermostat.heatModePayload]: 'thermostat.heatModePayload',
            [house.thermostat.heatingActionPayload]: 'thermostat.heatingActionPayload',
            [house.thermostat.idleActionPayload]: 'thermostat.idleActionPayload',
            [house.thermostat.modeStateTopic]: 'thermostat.modeStateTopic',
            [house.thermostat.targetTemperatureCommandTopic]: 'thermostat.targetTemperatureCommandTopic',
            [house.thermostat.targetTemperatureStateTopic]: 'thermostat.targetTemperatureStateTopic',
            [room.actualTemperatureStateTopic]: `rooms.${room.name}.actualTemperatureStateTopic`,
            [room.targetTemperatureStateTopic]: `rooms.${room.name}.targetTemperatureStateTopic`,
            [vent.closePositionPayload]: `rooms.${room.name}.vents.${vent.name}.closePositionPayload`,
            [vent.closedStatePayload]: `rooms.${room.name}.vents.${vent.name}.closedStatePayload`,
            [vent.positionCommandTopic]: `rooms.${room.name}.vents.${vent.name}.positionCommandTopic`,
            [vent.openPositionPayload]: `rooms.${room.name}.vents.${vent.name}.openPositionPayload`,
            [vent.openedStatePayload]: `rooms.${room.name}.vents.${vent.name}.openedStatePayload`,
            [vent.positionStateTopic]: `rooms.${room.name}.vents.${vent.name}.positionStateTopic`,
        });
    });
});
