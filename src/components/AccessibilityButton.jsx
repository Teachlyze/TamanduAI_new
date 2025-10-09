import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Sun, Moon, Globe, RotateCcw, Eye, Type, Settings } from 'lucide-react';
import Button from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import useTheme from '../hooks/useTheme';

const AccessibilityButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  const { currentLanguage, setLanguage, supportedLanguages } = useLanguageDetection();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : {
      fontSize: 16,
      highContrast: false,
      lineSpacing: 1.5,
      letterSpacing: 0,
    };
  });

  // Track if language was manually selected and store original browser language
  const [isLanguageManual, setIsLanguageManual] = useState(false);
  const [originalBrowserLanguage, setOriginalBrowserLanguage] = useState(null);

  // Aplicar configurações
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${settings.fontSize}px`;
    root.style.lineHeight = settings.lineSpacing;
    root.style.letterSpacing = `${settings.letterSpacing}px`;

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Store original browser language on first render
  useEffect(() => {
    if (!originalBrowserLanguage && currentLanguage) {
      setOriginalBrowserLanguage(currentLanguage);
    }
  }, [currentLanguage, originalBrowserLanguage]);

  const hasActiveSettings = 
    settings.fontSize !== 16 || 
    settings.highContrast || 
    settings.lineSpacing !== 1.5 || 
    settings.letterSpacing !== 0;

  const handleLanguageChange = async (langCode) => {
    try {
      await setLanguage(langCode);
      setIsLanguageManual(true);
    } catch (error) {
      console.error('Erro ao alterar idioma:', error);
    }
  };

  return (
    <>
      {/* Botão Principal - Estilo antigo com gradiente */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 ${
          hasActiveSettings ? 'ring-2 ring-orange-400' : ''
        }`}
        aria-label="Menu de acessibilidade"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <Accessibility className="w-5 h-5" />
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-1 -right-1"
          >
            <Settings className="w-3 h-3" />
          </motion.div>
        </div>
        <span className="hidden sm:inline font-medium">Acessibilidade</span>

        {/* Notification dot */}
        {hasActiveSettings && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white animate-pulse"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full h-full bg-orange-500 rounded-full"
            />
          </motion.div>
        )}
      </motion.button>

      {/* Painel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`fixed bottom-20 right-4 w-80 max-w-[calc(100vw-2rem)] rounded-2xl shadow-xl border z-50 overflow-hidden ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              {/* Cabeçalho */}
              <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Acessibilidade</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
                {/* Tema - Toggle melhorado */}
                <div className="p-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-slate-800 rounded-2xl border-2 border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-gray-900/30 dark:to-slate-900/30 rounded-lg flex items-center justify-center">
                        {isDark ? <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" /> : <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Tema: {isDark ? 'Escuro' : 'Claro'}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Alternar entre tema claro e escuro
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toggleTheme}
                      className="h-8 px-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      {isDark ? <Sun className="w-3 h-3 mr-1" /> : <Moon className="w-3 h-3 mr-1" />}
                      {isDark ? 'Claro' : 'Escuro'}
                    </Button>
                  </div>
                </div>

                {/* Alto contraste - Toggle melhorado */}
                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                          Alto Contraste
                        </h4>
                        <p className="text-xs text-purple-700 dark:text-purple-400">
                          Melhora a visibilidade com cores fortes
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          settings.highContrast
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        role="switch"
                        aria-checked={settings.highContrast}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                            settings.highContrast ? 'translate-x-8' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tamanho do texto - Simples */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Tamanho do Texto
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 2) }))}
                      disabled={settings.fontSize <= 12}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      <span className="text-lg font-bold">-</span>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{settings.fontSize}</span>
                      <span className="text-xs text-gray-500 ml-1">px</span>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.min(24, prev.fontSize + 2) }))}
                      disabled={settings.fontSize >= 24}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>

                {/* Espaçamento entre linhas */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Espaçamento entre Linhas</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, lineSpacing: Math.max(1.0, prev.lineSpacing - 0.2) }))}
                      disabled={settings.lineSpacing <= 1.0}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      <span className="text-lg font-bold">-</span>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{settings.lineSpacing.toFixed(1)}</span>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, lineSpacing: Math.min(2.5, prev.lineSpacing + 0.2) }))}
                      disabled={settings.lineSpacing >= 2.5}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>

                {/* Espaçamento entre letras */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Espaçamento entre Letras</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, letterSpacing: Math.max(0, prev.letterSpacing - 0.5) }))}
                      disabled={settings.letterSpacing <= 0}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      <span className="text-lg font-bold">-</span>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{settings.letterSpacing}</span>
                      <span className="text-xs text-gray-500 ml-1">px</span>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, letterSpacing: Math.min(3, prev.letterSpacing + 0.5) }))}
                      disabled={settings.letterSpacing >= 3}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      <span className="text-lg font-bold">+</span>
                    </button>
                  </div>
                </div>

                {/* Idioma - Simples */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Idioma</label>
                  <div className="grid grid-cols-3 gap-2">
                    {supportedLanguages.map((lang) => (
                      <Button
                        key={lang.code}
                        variant={currentLanguage.code === lang.code ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLanguageChange(lang.code)}
                        className="h-10 flex flex-col items-center justify-center gap-1 p-1"
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-xs">{lang.code.toUpperCase()}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSettings({
                        fontSize: 16,
                        highContrast: false,
                        lineSpacing: 1.5,
                        letterSpacing: 0,
                      });
                      if (!isLanguageManual && originalBrowserLanguage) {
                        handleLanguageChange(originalBrowserLanguage.code);
                        setIsLanguageManual(false);
                      }
                    }}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Pronto
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityButton;
