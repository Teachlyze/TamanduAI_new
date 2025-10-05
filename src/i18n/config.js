import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';

// Check if i18n is already initialized
if (!i18n.isInitialized) {
  // Get saved language from localStorage or default to Portuguese
  const savedLanguage = localStorage.getItem('tamanduai-language') || 'pt';

  i18n
    .use(initReactI18next)
    .init({
      lng: savedLanguage,
      fallbackLng: 'pt',
      debug: false, // Disable debug in production
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      resources: {
        pt: { translation: pt },
        en: { translation: en },
        es: { translation: es },
      },
    });

  // Save language preference when it changes
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem('tamanduai-language', lng);
    document.documentElement.setAttribute('lang', lng);
  });
}

export default i18n;
