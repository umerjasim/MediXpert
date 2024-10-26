import * as i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import * as englishStrings from './en.json';
import * as malayalamStrings from './ml.json';

// Translation messages.
const resources = {
    // English
    en: { translation: englishStrings },
    // Malayalam
    ml: { translation: malayalamStrings },
};

const defaultLanguage = localStorage.getItem('mx-language') ?? 'en';

i18n.use(initReactI18next)
.init({
    // Config options

    resources, 

    // Specifies the default language (locale) used
    // when a user visits our site for the first time.                
    lng: defaultLanguage,

    // Fallback locale used when a translation is
    // missing in the active locale. Again, use your
    // preferred locale here. 
    fallbackLng: "en",

    // Enables useful output in the browser’s
    // dev console.
    debug: false,

    // Normally, we want `escapeValue: true` as it
    // ensures that i18next escapes any code in
    // translation messages, safeguarding against
    // XSS (cross-site scripting) attacks. However,
    // React does this escaping itself, so we turn 
    // it off in i18next.
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;