import { readGoogleSheetData, sheetDataToResource } from './tools';

// eslint-disable-next-line consistent-return
export const i18nFromGoogleSheetExpress = async (req: any, res: any, next: Function) => {
  try {
    const [,data] = await readGoogleSheetData();
    const resource = await sheetDataToResource(data);
    return res.json(resource);
  } catch (e) {
    next(e);
  }
};
