import {Chance} from 'chance';
import {getAllStateTopicsFromObject} from '../../src/services/topicService';

const chance = new Chance();

describe('topicService', () => {
    const vent = {
        closePayload: chance.word(),
        closedState: chance.word(),
        name: chance.word(),
        openPayload: chance.word(),
        openedState: chance.word(),
        positionCommandTopic: chance.word(),
        positionStateTopic: chance.word(),
    };
    const room = {
        actualTemperatureStateTopic: chance.word(),
        name: chance.word(),
        targetTemperatureCommandTopic: chance.word(),
        targetTemperatureStateTopic: chance.word(),
        vents: [vent],
    };
    const thermostat = {
        actualTemperatureStateTopic: chance.word(),
        name: chance.word(),
        targetTemperatureCommandTopic: chance.word(),
        targetTemperatureStateTopic: chance.word(),
    };
    const house = {
        rooms: [room],
        thermostat,
    };

    it('should return all topics for house', () => {
        const topics = getAllStateTopicsFromObject(house);

        expect(topics).toEqual([
            room.actualTemperatureStateTopic,
            room.targetTemperatureStateTopic,
            vent.positionStateTopic,
            thermostat.actualTemperatureStateTopic,
            thermostat.targetTemperatureStateTopic,
        ]);
    });

    it('should return all topics for simple object', () => {
        const object = {
            barFooCommandTopic: chance.string(),
            fooBar: {
                barFoo: {
                    fooBarStateTopic: chance.string(),
                },
                barStateTopic: chance.string(),
            },
            fooStateTopic: chance.string(),
        };

        const topics = getAllStateTopicsFromObject(object);

        expect(topics).toEqual([
            object.fooBar.barFoo.fooBarStateTopic,
            object.fooBar.barStateTopic,
            object.fooStateTopic,
        ]);
    });
});
