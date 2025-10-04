import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Supported languages
export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  zh: { name: 'Chinese', nativeName: '中文', dir: 'ltr' },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

// Language detection options
const detectionOptions = {
  // Order of language detection
  order: ['localStorage', 'navigator', 'htmlTag'],

  // Keys to look up language from
  lookupLocalStorage: 'i18nextLng',

  // Cache user language
  caches: ['localStorage'],

  // Don't exclude cached language
  excludeCacheFor: [],
};

i18n
  // Load translation files
  .use(HttpBackend)

  // Detect user language
  .use(LanguageDetector)

  // Pass i18n instance to react-i18next
  .use(initReactI18next)

  // Initialize i18next
  .init({
    // Fallback language
    fallbackLng: 'en',

    // Supported languages
    supportedLngs: Object.keys(supportedLanguages),

    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',

    // Namespace for translations
    ns: ['common', 'auth', 'chat', 'settings', 'errors'],
    defaultNS: 'common',

    // Language detection
    detection: detectionOptions,

    // Backend options for loading translations
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React options
    react: {
      useSuspense: true,
    },
  });

// Update HTML dir attribute when language changes
i18n.on('languageChanged', (lng: string) => {
  const language = lng as SupportedLanguage;
  const direction = supportedLanguages[language]?.dir || 'ltr';
  document.documentElement.setAttribute('dir', direction);
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
