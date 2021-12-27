import Config from '../types/Config';
import Mqtt from '../types/Mqtt';

export default interface Options {
    config: Config;
    log: boolean;
    mqtt: Mqtt;
}
