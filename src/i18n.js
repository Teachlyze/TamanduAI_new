import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from './i18n/translations';

// Get saved language from localStorage or use browser default
const getSavedLanguage = () => {
  const saved = localStorage.getItem('tamanduai-language');
  if (saved && ['pt', 'en', 'es'].includes(saved)) {
    return saved;
  }
  
  // Detect browser language
  const browserLang = navigator.language.split('-')[0];
  return ['pt', 'en', 'es'].includes(browserLang) ? browserLang : 'pt';
};

// Language detector configuration
const languageDetector = new LanguageDetector();
languageDetector.addDetector({
  name: 'tamanduaiStorage',
  lookup() {
    return getSavedLanguage();
  },
  cacheUserLanguage(lng) {
    localStorage.setItem('tamanduai-language', lng);
  }
});

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: translations,
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en', 'es'],
    detection: {
      order: ['tamanduaiStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'tamanduai-language'
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Subscribe to language changes and save to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('tamanduai-language', lng);
  document.documentElement.setAttribute('lang', lng);
});

// Set initial lang attribute
document.documentElement.setAttribute('lang', i18n.language);

// Export the changeLanguage function for external use
export const changeLanguage = async (languageCode) => {
  try {
    await i18n.changeLanguage(languageCode);
    return true;
  } catch (error) {
    console.error('Erro ao alterar idioma:', error);
    return false;
  }
};

// Get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'pt', name: 'Português', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  ];
};

export default i18n;
