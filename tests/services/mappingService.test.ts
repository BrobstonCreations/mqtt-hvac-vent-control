import {Chance} from 'chance';

import {House} from '../../src/types/Mqtt';

import {createMappingObject} from '../../src/services/mappingService';

const chance = new Chance();

describe('mappingService', () => {
    it('should create mapping object with mqtt topic to value', () => {
        const house = {
            rooms: [{
                actualTemperatureStateTopic: chance.word(),
                targetTemperatureStateTopic: chance.word(),
                vents: [{
                    positionStateTopic: chance.word(),
                }],
            }],
            thermostat: {
                actualTemperatureStateTopic: chance.word(),
                targetTemperatureStateTopic: chance.word(),
            },
        } as House;

        const mappingObject = createMappingObject(house);

        expect(mappingObject).toEqual({
            [house.thermostat.actualTemperatureStateTopic]: 'house.thermostat.actualTemperature',
            [house.thermostat.targetTemperatureStateTopic]: 'house.thermostat.targetTemperature',
            [house.rooms[0].actualTemperatureStateTopic]: 'house.rooms[0].actualTemperature',
            [house.rooms[0].targetTemperatureStateTopic]: 'house.rooms[0].targetTemperature',
            [house.rooms[0].vents[0].positionStateTopic]: 'house.rooms[0].vents[0].position',
        });
    });
});
