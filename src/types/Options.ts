import House from './House';
import MqttConnection from './Mqtt';

export default interface Options {
    house: House;
    log: boolean;
    mqtt: MqttConnection;
}
