export const getAllStateTopicsFromArray = (array: Array<{[key: string]: any}>): string[] =>
    array.reduce((accumulator: string[], value: any): string[] => ([
        ...accumulator,
        ...getAllStateTopicsFromObject(value),
    ]), []);

export const getAllStateTopicsFromObject = (object: {[key: string]: any}): string[] =>
    Object.keys(object).reduce((accumulator: string[], key: string) => ([
        ...accumulator,
        ...getAllStateTopics(key, object[key]),
    ]), []);

const getAllStateTopics = (key: string, value: any): string[] => {
    if (Array.isArray(value)) {
        return getAllStateTopicsFromArray(value);
    } else if (!Array.isArray(value) && typeof(value) === 'object') {
        return getAllStateTopicsFromObject(value);
    } else if (typeof(value) === 'string' && key.endsWith('StateTopic')) {
        return [value];
    }
    return [];
};
