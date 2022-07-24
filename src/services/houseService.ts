export const isMode = (
    modePayload: string,
    modeStateTopic: string,
    messages: {[key: string]: string},
): boolean => messages[modeStateTopic] === modePayload;
