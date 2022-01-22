export interface Thermostat {
    actualTemperature: number|null;
    name: string;
    targetTemperature: number|null;
}

export interface Room {
    actualTemperature: number|null;
    name: string;
    targetTemperature: number|null;
    vents: Vent[];
}

export interface Vent {
    name: string;
    state: 'opened'|'closed'|null;
}

export interface House {
    rooms: Room[];
    thermostat: Thermostat;
}
