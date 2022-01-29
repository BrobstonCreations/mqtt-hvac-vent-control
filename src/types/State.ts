export interface House {
    rooms: Rooms;
    thermostat: Thermostat;
}

export interface Rooms {
    [key: string]: Room;
}

export interface Room {
    actualTemperature: number|null;
    targetTemperature: number|null;
    vents: Vents;
}

export interface Vents {
    [key: string]: Vent;
}

export interface Vent {
    position: number|null;
}

export interface Thermostat {
    action: string|null;
    actualTemperature: number|null;
    mode: string|null;
    name: string;
    targetTemperature: number|null;
}
