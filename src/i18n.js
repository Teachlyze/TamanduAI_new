import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Basic translations
const pt = {
  translation: {
    // Common
    "common.loading": "Carregando...",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",

    // Accessibility
    "accessibility.title": "Acessibilidade",
    "accessibility.subtitle": "Personalize sua experiência",
    "accessibility.reset": "Resetar",
    "accessibility.done": "Pronto",
    "accessibility.lightMode": "Modo Claro",
    "accessibility.darkMode": "Modo Escuro",
    "accessibility.themeDesc": "Alternar entre modo claro e escuro",
    "accessibility.light": "Claro",
    "accessibility.dark": "Escuro",
    "accessibility.languageDesc": "Selecione seu idioma preferido",
    "accessibility.fontSize": "Tamanho do Texto",
    "accessibility.fontSizeDesc": "Ajuste o tamanho da fonte",
    "accessibility.highContrast": "Alto Contraste",
    "accessibility.highContrastDesc": "Melhore a visibilidade com cores mais fortes",
    "accessibility.dyslexiaFont": "Fonte para Dislexia",
    "accessibility.dyslexiaFontDesc": "Use fonte otimizada para leitura",
    "accessibility.reducedMotion": "Reduzir Animações",
    "accessibility.reducedMotionDesc": "Diminua movimentos para reduzir enjoo",
    "accessibility.autoSave": "Suas configurações são salvas automaticamente"
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: pt,
    },
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
