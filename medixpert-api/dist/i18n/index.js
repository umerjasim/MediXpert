"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguageFromRequest = exports.geti18nResponseTemplate = exports.geti18nText = exports.geti18nResponse = void 0;
const fs_1 = __importDefault(require("fs"));
const en_json_1 = __importDefault(require("./en.json"));
const ml_json_1 = __importDefault(require("./ml.json"));
const path_1 = __importDefault(require("path"));
const languageStrings = {};
languageStrings.en = en_json_1.default;
languageStrings.ml = ml_json_1.default;
const geti18nResponse = (req, key, messageObj) => {
    let language = req.headers['accept-language'];
    if (!Object.keys(languageStrings).includes(language)) {
        language = 'en';
    }
    const translatedString = languageStrings[language][key];
    return { code: messageObj.code, message: translatedString || messageObj.message };
};
exports.geti18nResponse = geti18nResponse;
const geti18nText = (language, message) => {
    let lang = language;
    if (!Object.keys(languageStrings).includes(language)) {
        lang = 'en';
    }
    return languageStrings[lang][message];
};
exports.geti18nText = geti18nText;
const geti18nResponseTemplate = (language, templateName, isReports = false) => {
    const reportsFilePath = path_1.default.join(__dirname, `./templates/reports/${templateName}_${language}.html`);
    const templatesFilePath = path_1.default.join(__dirname, `./templates/${templateName}_${language}.html`);
    let data;
    if (isReports && fs_1.default.existsSync(reportsFilePath)) {
        data = fs_1.default.readFileSync(reportsFilePath);
    }
    else if (fs_1.default.existsSync(templatesFilePath)) {
        data = fs_1.default.readFileSync(templatesFilePath);
    }
    return data.toString() || '';
};
exports.geti18nResponseTemplate = geti18nResponseTemplate;
const getLanguageFromRequest = (request) => {
    var _a;
    let language = 'en'; // Default language fallback
    if ((_a = request === null || request === void 0 ? void 0 : request.headers) === null || _a === void 0 ? void 0 : _a['accept-language']) {
        language = request.headers['accept-language'];
    }
    return language;
};
exports.getLanguageFromRequest = getLanguageFromRequest;
