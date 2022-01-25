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
                targetTemperatureCommandTopic: chance.word(),
                targetTemperatureStateTopic: chance.word(),
                vents: [{
                    name: chance.word(),
                    positionCommandTopic: chance.word(),
                    positionStateTopic: chance.word(),
                }],
            }],
            thermostat: {
                actualTemperatureStateTopic: chance.word(),
                name: chance.string(),
                targetTemperatureCommandTopic: chance.word(),
                targetTemperatureStateTopic: chance.word(),
            },
        } as House;

        const mappingObject = topicToMemory(house);

        const room = house.rooms[0];
        const vent = room.vents[0];
        expect(mappingObject).toEqual({
            [house.thermostat.actualTemperatureStateTopic]: 'thermostat.actualTemperatureStateTopic',
            [house.thermostat.targetTemperatureCommandTopic]: 'thermostat.targetTemperatureCommandTopic',
            [house.thermostat.targetTemperatureStateTopic]: 'thermostat.targetTemperatureStateTopic',
            [room.actualTemperatureStateTopic]: `rooms.${room.name}.actualTemperatureStateTopic`,
            [room.targetTemperatureCommandTopic]: `rooms.${room.name}.targetTemperatureCommandTopic`,
            [room.targetTemperatureStateTopic]: `rooms.${room.name}.targetTemperatureStateTopic`,
            [vent.positionCommandTopic]: `rooms.${room.name}.vents.${vent.name}.positionCommandTopic`,
            [vent.positionStateTopic]: `rooms.${room.name}.vents.${vent.name}.positionStateTopic`,
        });
    });
});
