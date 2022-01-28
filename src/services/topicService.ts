export const getAllTopicsFromArray = (array: Array<{[key: string]: any}>, excludes: string[] = []): string[] =>
    array.reduce((accumulator: string[], value: any): string[] => ([
        ...accumulator,
        ...getAllTopicsFromObject(value, excludes),
    ]), []);

export const getAllTopicsFromObject = (object: {[key: string]: any}, excludes: string[] = []): string[] =>
    Object.keys(object).reduce((accumulator: string[], key: string) => ([
        ...accumulator,
        ...getAllTopics(key, object[key], excludes),
    ]), []);

const getAllTopics = (key: string, value: any, excludes: string[]): string[] => {
    if (Array.isArray(value)) {
        return getAllTopicsFromArray(value, excludes);
    } else if (!Array.isArray(value) && typeof(value) === 'object') {
        return getAllTopicsFromObject(value, excludes);
    } else if (typeof(value) === 'string' && key.endsWith('Topic') && !excludes.includes(key)) {
        return [value];
    }
    return [];
};
