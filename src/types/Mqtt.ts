export interface House {
    rooms: Room[];
    thermostat: Thermostat;
    modeDaytimePayload?: string;
    modeNighttimePayload?: string;
    modeStateTopic?: string;
}

export interface Room {
    actualTemperatureStateTopic: string;
    isNighttimeRoom?: boolean;
    name: string;
    modeCommandTopic: string;
    targetTemperatureStateTopic: string;
    vents: Vent[];
}

export interface Vent {
    closePositionPayload: string;
    closedStatePayload: string;
    closedWhenIdle?: boolean;
    positionCommandTopic: string;
    name: string;
    openPositionPayload: string;
    openedStatePayload: string;
    positionStateTopic: string;
}

export interface Thermostat {
    actionStateTopic: string;
    actualTemperatureStateTopic: string;
    coolingActionPayload: string;
    coolModePayload: string;
    heatingActionPayload: string;
    heatModePayload: string;
    idleActionPayload: string;
    modeStateTopic: string;
    name: string;
    targetTemperatureCommandTopic: string;
    targetTemperatureStateTopic: string;
}

export interface MqttConnection {
    host: string;
    port: number;
    username?: string;
    password?: string;
}
