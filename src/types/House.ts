import Room from './Room';
import Thermostat from './Thermostat';

export default interface House {
    rooms: Room[];
    thermostat: Thermostat;
}
