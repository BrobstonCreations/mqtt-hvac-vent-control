import {Chance} from 'chance';
import {getAllTopicsFromObject} from '../../src/services/topicService';

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
        const topics = getAllTopicsFromObject(house);

        expect(topics).toEqual([
            room.actualTemperatureStateTopic,
            room.targetTemperatureCommandTopic,
            room.targetTemperatureStateTopic,
            vent.positionCommandTopic,
            vent.positionStateTopic,
            thermostat.actualTemperatureStateTopic,
            thermostat.targetTemperatureCommandTopic,
            thermostat.targetTemperatureStateTopic,
        ]);
    });

    it('should return all topics for simple object', () => {
        const object = {
            fooBar: {
                barFoo: {
                    fooBarTopic: chance.string(),
                },
                barTopic: chance.string(),
            },
            fooTopic: chance.string(),
        };

        const topics = getAllTopicsFromObject(object);

        expect(topics).toEqual([
            object.fooBar.barFoo.fooBarTopic,
            object.fooBar.barTopic,
            object.fooTopic,
        ]);
    });
});