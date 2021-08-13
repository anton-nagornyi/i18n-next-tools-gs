import * as fs from 'fs/promises';

export const exists = async (path: string): Promise<boolean> => {
  try {
    await fs.access(path);
    return true;
  } catch (e) {
    return false;
  }
};
