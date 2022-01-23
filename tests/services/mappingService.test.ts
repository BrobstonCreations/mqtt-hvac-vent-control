import {Chance} from 'chance';

import {House} from '../../src/types/Mqtt';

import {createMappingObject} from '../../src/services/mappingService';

const chance = new Chance();

describe('mappingService', () => {
    it('should create mapping object with mqtt topic to value', () => {
        const house = {
            rooms: [{
                actualTemperatureStateTopic: chance.word(),
                name: chance.word(),
                targetTemperatureStateTopic: chance.word(),
                vents: [{
                    name: chance.word(),
                    positionStateTopic: chance.word(),
                }],
            }],
            thermostat: {
                actualTemperatureStateTopic: chance.word(),
                name: chance.string(),
                targetTemperatureStateTopic: chance.word(),
            },
        } as House;

        const mappingObject = createMappingObject(house);

        const room = house.rooms[0];
        const vent = room.vents[0];
        expect(mappingObject).toEqual({
            [house.thermostat.actualTemperatureStateTopic]: 'thermostat.actualTemperature',
            [house.thermostat.targetTemperatureStateTopic]: 'thermostat.targetTemperature',
            [room.actualTemperatureStateTopic]: `rooms.${room.name}.actualTemperature`,
            [room.targetTemperatureStateTopic]: `rooms.${room.name}.targetTemperature`,
            [vent.positionStateTopic]: `rooms.${room.name}.vents.${vent.name}.position`,
        });
    });
});
