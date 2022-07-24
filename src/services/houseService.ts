export const isMode = (
    messages: { [p: string]: string },
    modePayload?: string,
    modeStateTopic?: string,
): boolean => !!(modeStateTopic && messages[modeStateTopic] === modePayload);
