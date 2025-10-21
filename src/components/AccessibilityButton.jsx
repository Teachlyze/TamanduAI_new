import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Sun, Moon, Globe, RotateCcw, Eye, Type, Settings } from 'lucide-react';
import Button from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import useTheme from '../hooks/useTheme';
  const AccessibilityButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => {
    // Minimizar após primeiro acesso
    return localStorage.getItem('accessibility-minimized') === 'true';
  });
  
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
  
  // Auto-minimize após 5 segundos quando usuário autenticado entra
  useEffect(() => {
    const hasMinimized = localStorage.getItem('accessibility-minimized');
    if (!hasMinimized) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
        localStorage.setItem('accessibility-minimized', 'true');
      }, 5000);
      if (loading) return <LoadingScreen />;

  return () => clearTimeout(timer);
    }
  }, []);

  // Aplicar configurações
  useEffect(() => {
    const applySettings = () => {
      // console.log('Aplicando configurações:', settings);

      // Aplicar configurações no documentElement
      const root = document.documentElement;

      if (settings.fontSize && settings.fontSize !== 16) {
        root.style.fontSize = `${settings.fontSize}px`;
        // console.log('Aplicado fontSize:', settings.fontSize);
      } else {
        root.style.fontSize = '16px';
      }

      if (settings.lineSpacing && settings.lineSpacing !== 1.5) {
        root.style.lineHeight = settings.lineSpacing.toString();
        // console.log('Aplicado lineHeight:', settings.lineSpacing);
      } else {
        root.style.lineHeight = '1.5';
      }

      if (settings.letterSpacing !== undefined && settings.letterSpacing !== 0) {
        root.style.letterSpacing = `${settings.letterSpacing}px`;
        // console.log('Aplicado letterSpacing:', settings.letterSpacing);
      } else {
        root.style.letterSpacing = '0px';
      }

      if (settings.highContrast) {
        root.classList.add('high-contrast');
        // console.log('Aplicado highContrast: true');
      } else {
        root.classList.remove('high-contrast');
        // console.log('Removido highContrast');
      }

      // Aplicar também no body e em todos os elementos
      const body = document.body;
      if (body) {
        if (settings.fontSize && settings.fontSize !== 16) {
          body.style.fontSize = `${settings.fontSize}px`;
        } else {
          body.style.fontSize = '16px';
        }

        if (settings.lineSpacing && settings.lineSpacing !== 1.5) {
          body.style.lineHeight = settings.lineSpacing.toString();
        } else {
          body.style.lineHeight = '1.5';
        }

        if (settings.letterSpacing !== undefined && settings.letterSpacing !== 0) {
          body.style.letterSpacing = `${settings.letterSpacing}px`;
        } else {
          body.style.letterSpacing = '0px';
        }

        if (settings.highContrast) {
          body.classList.add('high-contrast');
        } else {
          body.classList.remove('high-contrast');
        }
      }

      // Aplicar em todas as divs principais também
      const mainElements = document.querySelectorAll('div, p, span, h1, h2, h3, h4, h5, h6, button, a, input, textarea, select');
      mainElements.forEach(element => {
        if (settings.fontSize && settings.fontSize !== 16) {
          element.style.fontSize = `${settings.fontSize}px`;
        }

        if (settings.lineSpacing && settings.lineSpacing !== 1.5) {
          element.style.lineHeight = settings.lineSpacing.toString();
        }

        if (settings.letterSpacing !== undefined && settings.letterSpacing !== 0) {
          element.style.letterSpacing = `${settings.letterSpacing}px`;
        }
      });

      // console.log('Configurações aplicadas com sucesso');
    };

    applySettings();
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));

    // Disparar evento personalizado para atualizar outros componentes
    window.dispatchEvent(new CustomEvent('accessibilitySettingsChanged', {
      detail: settings
    }));
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
      // console.log('Tentando alterar idioma para:', langCode);
      await setLanguage(langCode);
      setIsLanguageManual(true);

      // Não recarregar a página, apenas atualizar o estado
      // console.log('Idioma alterado com sucesso para:', langCode);

      // Forçar atualização dos componentes que usam i18n
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: langCode }));
    } catch (error) {
      console.error('Erro ao alterar idioma:', error);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      {/* Botão Principal - Responsivo */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          width: isMinimized ? '56px' : 'auto',
          paddingLeft: isMinimized ? '14px' : '20px',
          paddingRight: isMinimized ? '14px' : '20px'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsMinimized(false)}
        className="group relative flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-700 hover:opacity-90"
        style={{
          background: 'linear-gradient(to right, #2563eb, #9333ea, #4338ca)',
          borderColor: '#1d4ed8',
          zIndex: 9999,
          position: 'relative',
          minHeight: '56px',
          minWidth: '56px'
        }}
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
        
        {/* Texto - aparece apenas quando expandido */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-medium whitespace-nowrap overflow-hidden"
            >
              Acessibilidade
            </motion.span>
          )}
        </AnimatePresence>

        {/* Notification dot */}
        {hasActiveSettings && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white animate-pulse"
            style={{
              backgroundColor: '#fbbf24',
              borderColor: 'white',
              zIndex: 10000
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full h-full bg-orange-500 rounded-full"
              style={{ backgroundColor: '#fbbf24' }}
            />
          </motion.div>
        )}
      </motion.button>

      {/* Painel */}
      <AnimatePresence>
        {isOpen && (
          <>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="fixed bottom-20 right-4 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl shadow-xl z-50 overflow-hidden"
              style={{
                // Garantir visibilidade mesmo com alto contraste
                zIndex: 10000,
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderColor: isDark ? '#6b7280' : '#9ca3af',
                borderWidth: '2px'
              }}
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
                <div className="p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                        {isDark ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                          {isDark ? 'Modo Escuro' : 'Modo Claro'}
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Conforto visual
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="w-14 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 dark:from-blue-500 dark:to-indigo-600 relative shadow-lg hover:shadow-xl transition-all duration-300 flex items-center text-white hover:opacity-90"
                    >
                      <div className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                        isDark ? 'right-1' : 'left-1'
                      }`}>
                        {isDark ? <Moon className="w-3 h-3 text-blue-600" /> : <Sun className="w-3 h-3 text-orange-600" />}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Alto contraste - Toggle melhorado */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Alto Contraste
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Melhor visibilidade
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                        settings.highContrast
                          ? 'bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
                          settings.highContrast ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      >
                        {settings.highContrast && <Eye className="w-3 h-3 text-blue-600" />}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tamanho do texto - Simples */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <Type className="w-4 h-4" />
                    Tamanho do Texto
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 2) }))}
                      disabled={settings.fontSize <= 12}
                      className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <span className="text-2xl font-bold text-white">−</span>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{settings.fontSize}</span>
                      <span className="text-xs text-gray-500 ml-1">px</span>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.min(24, prev.fontSize + 2) }))}
                      disabled={settings.fontSize >= 24}
                      className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <span className="text-2xl font-bold text-white">+</span>
                    </button>
                  </div>
                </div>

                {/* Espaçamento entre linhas */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">Espaçamento entre Linhas</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, lineSpacing: Math.max(1.0, prev.lineSpacing - 0.2) }))}
                      disabled={settings.lineSpacing <= 1.0}
                      className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <span className="text-2xl font-bold text-white">−</span>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{settings.lineSpacing.toFixed(1)}</span>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, lineSpacing: Math.min(2.5, prev.lineSpacing + 0.2) }))}
                      disabled={settings.lineSpacing >= 2.5}
                      className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <span className="text-2xl font-bold text-white">+</span>
                    </button>
                  </div>
                </div>

                {/* Espaçamento entre letras */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">Espaçamento entre Letras</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, letterSpacing: Math.max(0, prev.letterSpacing - 0.5) }))}
                      disabled={settings.letterSpacing <= 0}
                      className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <span className="text-2xl font-bold text-white">−</span>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{settings.letterSpacing}</span>
                      <span className="text-xs text-gray-500 ml-1">px</span>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, letterSpacing: Math.min(3, prev.letterSpacing + 0.5) }))}
                      disabled={settings.letterSpacing >= 3}
                      className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <span className="text-2xl font-bold text-white">+</span>
                    </button>
                  </div>
                </div>

                {/* Idioma - Intuitivo */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Idioma</label>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {isLanguageManual ? (
                      <>👉 Selecionado: <span className="font-semibold">{currentLanguage.nativeName}</span></>
                    ) : (
                      <>✨ Detectado: <span className="font-semibold">{currentLanguage.nativeName}</span></>
                    )}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                          currentLanguage.code === lang.code
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-xs font-semibold">{lang.code.toUpperCase()}</span>
                      </button>
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
