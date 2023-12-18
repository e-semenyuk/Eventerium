import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import * as Localization from 'react-native-localize';
import { Platform } from 'react-native';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (callback) => {
    const locale = Localization.locale || 'ru';

    callback(locale);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    resources: {
      en: {
        translation: require('./locales/en.json'),
      },
      ru: {
        translation: require('./locales/ru.json'),
      },
      // Add other languages here
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
