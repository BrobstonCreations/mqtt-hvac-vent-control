import {readFileSync} from 'jsonfile';

import Options from './../types/Options';

export const getOptionsFromEnvironmentOrFile = (): Options => {
    const optionsFilePath = process.env.OPTIONS_FILE_PATH;
    const options = process.env.OPTIONS;
    return optionsFilePath && readFileSync(optionsFilePath) || JSON.parse(options || '{}');
};
