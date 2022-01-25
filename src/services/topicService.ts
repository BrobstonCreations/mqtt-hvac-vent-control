export const getAllTopics = (object: any): string[] => {
    return Object.keys(object).reduce((accumulator: string[], key: string) => {
        const value = object[key];
        if (Array.isArray(value)) {
            return [
                ...accumulator,
                ...(value.reduce((innerAccumulator: string[], innerValue: any): string[] => {
                    return [
                        ...innerAccumulator,
                        ...getAllTopics(innerValue),
                    ];
                }, [])),
            ];
        } else if (!Array.isArray(value) && typeof(value) === 'object') {
            return [
                ...accumulator,
                ...getAllTopics(value),
            ];
        } else if (typeof(value) === 'string' && key.endsWith('Topic')) {
            return [
                ...accumulator,
                value,
            ];
        }
        return accumulator;
    }, []);
};
