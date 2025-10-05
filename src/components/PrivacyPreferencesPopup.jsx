import { useState, useEffect, useRef } from 'react';
import { X, Cookie, Settings, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRIVACY_PREFS_KEY = 'privacy-preferences';
const PRIVACY_ACCEPTED_KEY = 'privacy-preferences-accepted';

const PrivacyPreferencesPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(true);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });
  const popupRef = useRef(null);

  // Check if user has already accepted privacy preferences
  useEffect(() => {
    const hasAccepted = localStorage.getItem(PRIVACY_ACCEPTED_KEY) === 'true';
    setHasAccepted(hasAccepted);
    
    // Only show popup if user hasn't accepted yet
    if (!hasAccepted) {
      // Small delay to ensure the page is loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Load saved preferences on component mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem(PRIVACY_PREFS_KEY);
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Necessary cookies can't be disabled
    
    const newPrefs = {
      ...preferences,
      [key]: !preferences[key]
    };
    
    setPreferences(newPrefs);
    localStorage.setItem('privacy-preferences', JSON.stringify(newPrefs));
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ success: false, message: '' });

  const savePreferences = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call or any async operation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      localStorage.setItem(PRIVACY_PREFS_KEY, JSON.stringify(preferences));
      localStorage.setItem(PRIVACY_ACCEPTED_KEY, 'true');
      
      setHasAccepted(true);
      setSaveStatus({
        success: true,
        message: 'Preferências salvas com sucesso!'
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ success: false, message: '' });
        setIsOpen(false);
      }, 3000);
      
    } catch (error) {
      setSaveStatus({
        success: false,
        message: 'Erro ao salvar preferências. Tente novamente.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cookieTypes = [
    {
      key: 'necessary',
      title: 'Cookies Necessários',
      description: 'Essenciais para o funcionamento do site. Sempre ativados.',
      required: true
    },
    {
      key: 'analytics',
      title: 'Cookies Analíticos',
      description: 'Nos ajudam a entender como você usa nosso site.',
      required: false
    },
    {
      key: 'marketing',
      title: 'Cookies de Marketing',
      description: 'Usados para personalizar anúncios e conteúdo.',
      required: false
    }
  ];

  // Don't render anything if user has already accepted
  if (hasAccepted && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Floating Settings Button - Only show if user hasn't accepted yet */}
      {!hasAccepted && (
        <motion.button
          className="fixed bottom-8 left-8 z-40 privacy-settings-button group flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 dark:bg-gray-900/40 backdrop-blur-md border border-white/40 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-lg hover:bg-white/50 dark:hover:bg-gray-800/60 transition-all duration-300"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Configurações de privacidade"
        >
          {isOpen ? <X size={18} /> : <Settings size={18} />}
          <span className="hidden sm:inline text-sm font-medium">Privacidade</span>
        </motion.button>
      )}

      {/* Popup Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => !hasAccepted && setIsOpen(false)}
            />
            
            {/* Popup Content */}
            <motion.div
              ref={popupRef}
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-8 left-8 w-96 max-w-[calc(100vw-4rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Cookie className="text-white" size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Cookies & Privacidade
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Fechar"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      🍪 Usamos cookies para melhorar sua experiência. Você tem total controle sobre quais aceitar!
                    </p>
                  </div>

                  <div className="space-y-4">
                    {cookieTypes.map((cookie) => (
                      <div 
                        key={cookie.key}
                        className={`p-4 rounded-lg border ${
                          preferences[cookie.key] 
                            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {cookie.title}
                              </h3>
                              {cookie.required && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                  Sempre ativo
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {cookie.description}
                            </p>
                          </div>
                          {!cookie.required && (
                            <div className="ml-4 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => togglePreference(cookie.key)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  preferences[cookie.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                                role="switch"
                                aria-checked={preferences[cookie.key]}
                                aria-labelledby={`${cookie.key}-label`}
                              >
                                <span className="sr-only">
                                  {preferences[cookie.key] ? 'Desativar' : 'Ativar'} {cookie.title}
                                </span>
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    preferences[cookie.key] ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        const allAccepted = {
                          necessary: true,
                          analytics: true,
                          marketing: true
                        };
                        setPreferences(allAccepted);
                      }}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors duration-200"
                    >
                      Aceitar todos
                    </button>
                    <button
                      type="button"
                      onClick={savePreferences}
                      disabled={isSaving}
                      className={`w-full sm:w-auto px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                        isSaving 
                          ? 'bg-blue-400 cursor-not-allowed text-white' 
                          : saveStatus.success 
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Salvando...
                        </>
                      ) : saveStatus.success ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5" />
                          {saveStatus.message}
                        </>
                      ) : (
                        'Confirmar e fechar'
                      )}
                    </button>
                  </div>

                  {saveStatus.message && !isSaving && !saveStatus.success && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-start">
                      <X className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{saveStatus.message}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ao confirmar, você concorda com nossa{' '}
                    <a 
                      href="/privacy" 
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Política de Privacidade
                    </a>{' '}
                    e nossos{' '}
                    <a 
                      href="/terms" 
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Termos de Uso
                    </a>.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PrivacyPreferencesPopup;
