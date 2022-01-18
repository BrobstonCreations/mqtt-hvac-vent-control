import Configuration from './Configuration';
import Mqtt from './Mqtt';

export default interface Options {
    configuration: Configuration;
    log: boolean;
    mqtt: Mqtt;
}
