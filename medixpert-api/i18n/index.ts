import { Request } from 'express';
import fs from 'fs';
import { UserRequest } from '../helpers/jwt';
import englishStrings from './en.json';
import malayalamStrings from './ml.json';
import path from 'path';

type languageString = {
  [key: string]: {
    [key: string]: string;
  };
}

const languageStrings = {} as languageString;
languageStrings.en = englishStrings;
languageStrings.ml = malayalamStrings;

type messageObjType = {
  code?: number;
  message: string;
}
export const geti18nResponse = (
  req: UserRequest | Request | any,
  key: string,
  messageObj: messageObjType,
): messageObjType => {
  let language = req.headers['accept-language'];
  if (!Object.keys(languageStrings).includes(language)) {
    language = 'en';
  }
  const translatedString = languageStrings[language][key];
  return { code: messageObj.code, message: translatedString || messageObj.message };
};

export const geti18nText = (
  language: string,
  message: string,
): string => {
  let lang = language;
  if (!Object.keys(languageStrings).includes(language)) {
    lang = 'en';
  }
  return languageStrings[lang][message];
};

export const geti18nResponseTemplate = (
  language: string,
  templateName: string,
  isReports = false,
): string => {
  const reportsFilePath = path.join(__dirname, `./templates/reports/${templateName}_${language}.html`);
  const templatesFilePath = path.join(__dirname, `./templates/${templateName}_${language}.html`);
  let data: Buffer;
  if (isReports && fs.existsSync(reportsFilePath)) {
    data = fs.readFileSync(reportsFilePath);
  } else if (fs.existsSync(templatesFilePath)) {
    data = fs.readFileSync(templatesFilePath);
  }
  return data.toString() || '';
};

export const getLanguageFromRequest = (request: UserRequest | Request | any) => {
  let language = 'en'; // Default language fallback
  if (request?.headers?.['accept-language']) {
    language = request.headers['accept-language'];
  }
  return language;
};
