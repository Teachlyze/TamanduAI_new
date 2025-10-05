import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { useLanguageDetection } from '../hooks/useLanguageDetection';

const LanguageSettings = () => {
  const { i18n } = useTranslation();
  const { currentLanguage, setLanguage, supportedLanguages } = useLanguageDetection();

  const handleLanguageChange = async (languageCode) => {
    try {
      await setLanguage(languageCode);
    } catch (error) {
      console.error('[LanguageSettings] Error changing language:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Idioma
        </h3>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selecione o idioma da interface. O sistema detectará automaticamente o idioma do seu navegador,
          mas você pode alterá-lo aqui.
        </p>

        <div className="grid gap-2">
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                i18n.language === language.code
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <div className="text-left">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language.name}
                  </div>
                </div>
              </div>
              {i18n.language === language.code && (
                <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <div className="font-medium mb-1">Detecção Automática</div>
              <div>
                O sistema detecta automaticamente o idioma do seu navegador ({navigator.language || 'padrão do sistema'}).
                Você pode alterar esta configuração a qualquer momento.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
