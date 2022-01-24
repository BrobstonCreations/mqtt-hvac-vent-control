export interface MqttConnection {
    host: string;
    port: number;
    username?: string;
    password?: string;
}

export interface Thermostat {
    actualTemperatureStateTopic: string;
    name: string;
    targetTemperatureCommandTopic: string;
    targetTemperatureStateTopic: string;
}

export interface Room {
    actualTemperatureStateTopic: string;
    name: string;
    targetTemperatureCommandTopic: string;
    targetTemperatureStateTopic: string;
    vents: Vent[];
}

export interface Vent {
    closePayload: string;
    closedState: string;
    positionCommandTopic: string;
    name: string;
    openPayload: string;
    openedState: string;
    positionStateTopic: string;
}
export interface House {
    rooms: Room[];
    thermostat: Thermostat;
}
