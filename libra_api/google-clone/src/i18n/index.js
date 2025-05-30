import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import ko from './locales/ko.json';

// Configuration
i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    // Language resources
    resources: {
      en: {
        translation: en
      },
      ko: {
        translation: ko
      }
    },
    
    // Language settings
    fallbackLng: 'ko', // Default to Korean
    lng: 'ko', // Default language
    
    // Language detection options
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      
      // Keys for localStorage
      lookupLocalStorage: 'i18nextLng',
      
      // Cache user language
      caches: ['localStorage'],
      
      // Don't convert country code to language code
      convertDetectedLanguage: (lng) => {
        // Convert 'ko-KR' to 'ko', 'en-US' to 'en', etc.
        return lng.split('-')[0];
      }
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false // React already escapes by default
    },
    
    // Debug in development
    debug: process.env.NODE_ENV === 'development',
    
    // Namespace
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Key separator
    keySeparator: '.',
    
    // Nested separator
    nsSeparator: ':',
    
    // Pluralization
    pluralSeparator: '_',
    
    // Context
    contextSeparator: '_',
    
    // React options
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
    }
  });

export default i18n;
