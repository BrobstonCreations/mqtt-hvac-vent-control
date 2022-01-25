export const getAllTopicsFromArray = (array: Array<{[key: string]: any}>): string[] =>
    array.reduce((accumulator: string[], value: any): string[] => ([
        ...accumulator,
        ...getAllTopicsFromObject(value),
    ]), []);

export const getAllTopicsFromObject = (object: {[key: string]: any}): string[] =>
    Object.keys(object).reduce((accumulator: string[], key: string) => ([
        ...accumulator,
        ...getAllTopics(key, object[key]),
    ]), []);

const getAllTopics = (key: string, value: any): string[] => {
    if (Array.isArray(value)) {
        return getAllTopicsFromArray(value);
    } else if (!Array.isArray(value) && typeof(value) === 'object') {
        return getAllTopicsFromObject(value);
    } else if (typeof(value) === 'string' && key.endsWith('Topic')) {
        return [value];
    }
    return [];
};
