import { createContext, useContext, useState, useCallback } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import mr from '../i18n/mr.json';
import bn from '../i18n/bn.json';
import te from '../i18n/te.json';
import ta from '../i18n/ta.json';
import gu from '../i18n/gu.json';
import kn from '../i18n/kn.json';
import or from '../i18n/or.json';
import pa from '../i18n/pa.json';
import ml from '../i18n/ml.json';
import as from '../i18n/as.json';

const translations = { en, hi, mr, bn, te, ta, gu, kn, or, pa, ml, as };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferred_language') || 'en';
  });
  
  // Track if language has been explicitly selected this session/install
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(!!localStorage.getItem('preferred_language'));

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    setHasSelectedLanguage(true);
    localStorage.setItem('preferred_language', lang);
  }, []);

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, hasSelectedLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
