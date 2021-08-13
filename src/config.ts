import * as p from 'path';
import * as fss from 'fs';
import { exists } from './utils/fs';

const CONFIG_FILE = '18n-next-tools.json';
const CONFIG_PATH = p.join(process.cwd(), CONFIG_FILE);

let Config: {
  'available-langs': string[]
  'google': {
    'privateKey': string
    'spreadsheetId': string
  },
  'resourcesFile': string
};

export const config = async () => {
  if (!Config) {
    Config = await exists(CONFIG_PATH) ? JSON.parse(fss.readFileSync(CONFIG_PATH, 'utf-8'))
      : JSON.parse(fss.readFileSync(p.join(process.cwd(), 'package.json'), 'utf-8')).i18n;

    if (!Config) {
      throw new Error('18n-next-tools configuration is missing. Please refer readme to set it up.');
    }
  }
  return Config;
};
