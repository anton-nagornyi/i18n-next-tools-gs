import * as fs from 'fs/promises';
import { google, sheets_v4 } from 'googleapis';
import { createTranslations, mergeResources, scanResources } from 'i18n-next-tools';
import { config } from '../config';

export const readGoogleSheetData = async (): Promise<[sheets_v4.Sheets, string[][] | undefined]> => {
  const { google: googleSettings } = await config();
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  const privatekey = JSON.parse(await fs.readFile(googleSettings.privateKey, 'utf-8'));
  const auth = new google.auth.JWT(privatekey.client_email, undefined, privatekey.private_key, SCOPES);

  await auth.authorize();
  const sheets = google.sheets({ version: 'v4', auth });

  const sheet = await sheets.spreadsheets.values.get({
    spreadsheetId: googleSettings.spreadsheetId,
    range: 'A:Z',
  });
  const { values } = sheet.data;
  return [sheets, values];
};

const writeGoogleSheetData = async (sheets: sheets_v4.Sheets, data: string[][]) => {
  const { google: googleSettings } = await config();
  await sheets.spreadsheets.values.update({
    spreadsheetId: googleSettings.spreadsheetId,
    range: 'A:Z',
    valueInputOption: 'RAW',
    requestBody: { values: data },
  });
};

export const sheetDataToResource = (values?: string[][]): object => {
  const dist = {} as any;
  if (!values) {
    return dist;
  }
  const [,,...langs] = values[0];
  for (let i = 1; i < values.length; ++i) {
    const [ns, key, ...vals] = values[i];
    for (let j = 0; j < vals.length; ++j) {
      const lng = dist[langs[i]] || {} as any;
      const namespace = lng[ns] || {} as any;
      namespace[key] = vals[j];
      lng[ns] = namespace;
      dist[langs[i]] = lng;
    }
  }
  return dist;
};

const resourcesToSheetData = (distHeader: string[], resources: any): string[][] => {
  const res = new Array<Array<string>>();
  const langs = Object.keys(resources);
  const namespaces = Object.keys((resources)[langs[0]]);
  res.push([distHeader[0], distHeader[1], ...langs]);
  for (const ns of namespaces) {
    const keys = Object.keys((resources)[langs[0]][ns]);
    for (const key of keys) {
      res.push([ns, key, ...langs.map((lang) => resources[lang][ns][key])]);
    }
  }
  return res;
};

const uploadGoogleSheet = async () => {
  const [sheets, values] = await readGoogleSheetData();
  const dist = sheetDataToResource(values);
  const source = await scanResources();
  const merged = await mergeResources(source, dist);
  const sheetData = resourcesToSheetData(values![0], merged);
  await writeGoogleSheetData(sheets, sheetData);
  return [sheetData, merged];
};

export const sync = async () => {
  await createTranslations();
  const [, merged] = await uploadGoogleSheet();
  const resources = (await config()).resourcesFile;
  await fs.writeFile(resources, JSON.stringify(merged, null, '  '), 'utf-8');
};
