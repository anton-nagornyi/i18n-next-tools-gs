# i18n-next-tools

This is for syncing i18n-next translations with google sheets. 

## Install:

```shell script
npm install --save i18n-next-tools-gs
```

## Config:

You may provide `18n-next-tools.json` inside the project's root folder:
```json
{
    "available-langs": [
      "en",
      "ru",
      "ua"
    ],
    "source": "./src",
    "resourcesFile": "src/i18n/resources.json",
    "google": {
      "privateKey": "./google-project-aa3ebb5b3177.json",
      "spreadsheetId": "2Jwl37s05XW-RgY5F-ZTuNXme33rrag22k0EwUQmBZga"
    }
  }
```

or you may add `i18n` section to your `package.json` file with the config above.
* `available-langs` - languages that your app is translated to.
* `source` - path where to search for the source files with translations.
* `resourcesFile` - path to the file where to store scanned translations.
* `google` - provide google configuration if you are planning to sync your translations with google sheets. Otherwise it may be omitted.
* `google.privateKey` - obtain service account credentials from google. It should be json file with your private key.
* `google.spreadsheetId` - id of a spread sheet to sync with.

## Use:

To sync with `google sheets` call:
```shell script
npx i18nt-sync
```
This will:
1. do everything that `npx i18nt-create-translations` does.
2. download data from google sheet, compare it with `resourcesFile`, carefully merge them and upload result back to google.

You may also wish to provide translations from your backend:

```typescript
import {i18nFromGoogleSheetExpress} from 'i18n-next-tools';

const router = express.Router();

router.get('/translations', i18nFromGoogleSheetExpress);
``` 
