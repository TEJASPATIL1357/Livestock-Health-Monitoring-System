import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import { LanguageCode } from '../types';

export const RESOURCES = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
};

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

i18n.use(initReactI18next).init({
  resources: RESOURCES,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React handles XSS safely
  },
  compatibilityJSON: 'v4',
});

export const changeLanguage = async (lng: LanguageCode): Promise<void> => {
  await i18n.changeLanguage(lng);
};

export default i18n;
