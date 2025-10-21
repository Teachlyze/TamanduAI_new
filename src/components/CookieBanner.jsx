import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Cookie, Shield, Settings, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

  const COOKIE_CONSENT_KEY = 'cookie-consent';

const CookieBanner = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after 1 second
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      if (loading) return <LoadingScreen />;

  return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(allAccepted));
    setShowBanner(false);
    setShowCustomize(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
    setShowCustomize(false);
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Necessary cookies can't be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const cookieTypes = [
    {
      key: 'necessary',
      title: t('cookie.necessary', 'Cookies Necessários'),
      description: t('cookie.necessaryDesc', 'Essenciais para o funcionamento do site'),
      required: true
    },
    {
      key: 'analytics',
      title: t('cookie.analytics', 'Cookies Analíticos'),
      description: t('cookie.analyticsDesc', 'Nos ajudam a entender como você usa nosso site'),
      required: false
    },
    {
      key: 'marketing',
      title: t('cookie.marketing', 'Cookies de Marketing'),
      description: t('cookie.marketingDesc', 'Usados para personalizar anúncios e conteúdo'),
      required: false
    }
  ];

  if (!showBanner) return null;

  if (loading) return <LoadingScreen />;

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Overlay for customize mode */}
          {showCustomize && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
              onClick={() => setShowCustomize(false)}
            />
          )}

          {/* Cookie Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed ${showCustomize ? 'bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl' : 'bottom-0 left-0 right-0'} z-[1000] bg-white dark:bg-gray-800 shadow-2xl ${showCustomize ? 'rounded-2xl' : 'rounded-t-2xl md:rounded-2xl md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl'} border-t-4 border-blue-600`}
          >
            <div className="p-6">
              {!showCustomize ? (
                // Simple Banner
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg text-white hover:opacity-90">
                      <Cookie className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        {t('cookie.title', '🍪 Cookies & Privacidade')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {t('cookie.description', 'Usamos cookies para melhorar sua experiência. Você tem total controle sobre suas preferências de privacidade.')}
                      </p>
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleAcceptAll}
                          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:opacity-90"
                        >
                          <Check className="w-4 h-4" />
                          {t('cookie.acceptAll', 'Aceitar Todos')}
                        </button>
                        <button
                          onClick={() => setShowCustomize(true)}
                          className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          {t('cookie.customize', 'Personalizar')}
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {t('cookie.privacyPolicy', 'Política de Privacidade')}:{' '}
                        <Link to="/privacy-policy" className="text-blue-600 hover:underline">
                          Saiba mais
                        </Link>
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                // Customize Panel
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white hover:opacity-90">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('cookie.title', '🍪 Cookies & Privacidade')}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowCustomize(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    {cookieTypes.map((cookie) => (
                      <div
                        key={cookie.key}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                          preferences[cookie.key]
                            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-muted/30'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {cookie.title}
                              </h4>
                              {cookie.required && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 font-medium">
                                  Sempre ativo
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {cookie.description}
                            </p>
                          </div>
                          {!cookie.required && (
                            <button
                              onClick={() => togglePreference(cookie.key)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                preferences[cookie.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                              role="switch"
                              aria-checked={preferences[cookie.key]}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  preferences[cookie.key] ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-200"
                    >
                      {t('cookie.acceptAll', 'Aceitar Todos')}
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:opacity-90"
                    >
                      <Check className="w-4 h-4" />
                      {t('cookie.savePreferences', 'Salvar Preferências')}
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                    <Link to="/privacy-policy" className="text-blue-600 hover:underline">
                      {t('cookie.privacyPolicy', 'Política de Privacidade')}
                    </Link>
                    {' • '}
                    <Link to="/terms-of-use" className="text-blue-600 hover:underline">
                      {t('cookie.termsOfUse', 'Termos de Uso')}
                    </Link>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;

