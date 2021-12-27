import Vent from '../types/Vent';

export default interface Room {
    name: string;
    vents: Vent[];
}
