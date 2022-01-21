import House from './House';
import Mqtt from './Mqtt';

export default interface Options {
    house: House;
    log: boolean;
    mqtt: Mqtt;
}
