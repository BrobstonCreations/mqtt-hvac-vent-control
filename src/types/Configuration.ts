import Room from './Room';
import Thermostat from './Thermostat';

export default interface Configuration {
    rooms: Room[];
    thermostat: Thermostat;
}
