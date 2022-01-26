export interface MqttConnection {
    host: string;
    port: number;
    username?: string;
    password?: string;
}

export interface Thermostat {
    actualTemperatureStateTopic: string;
    coolModePayload: string;
    heatModePayload: string;
    modeStateTopic: string;
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
    closePositionPayload: string;
    closedStatePayload: string;
    positionCommandTopic: string;
    name: string;
    openPositionPayload: string;
    openedStatePayload: string;
    positionStateTopic: string;
}

export interface House {
    rooms: Room[];
    thermostat: Thermostat;
}
