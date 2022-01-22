import {House, MqttConnection} from './Mqtt';

export default interface Options {
    house: House;
    log: boolean;
    mqttConnection: MqttConnection;
}
