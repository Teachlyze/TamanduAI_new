/**
 * Enhanced Internationalization System for TamanduAI Platform
 * Advanced i18n with pluralization, interpolation, and performance optimizations
 */

// ============================================
// I18N CONFIGURATION
// ============================================

export const I18N_CONFIG = {
  // Supported languages
  LANGUAGES: {
    'pt-BR': {
      name: 'Português (Brasil)',
      nativeName: 'Português',
      flag: '🇧🇷',
      rtl: false,
      default: true,
    },
    'en-US': {
      name: 'English (US)',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false,
    },
    'es-ES': {
      name: 'Español (España)',
      nativeName: 'Español',
      flag: '🇪🇸',
      rtl: false,
    },
    'fr-FR': {
      name: 'Français (France)',
      nativeName: 'Français',
      flag: '🇫🇷',
      rtl: false,
    },
  },

  // Namespaces for organization
  NAMESPACES: [
    'common',
    'auth',
    'dashboard',
    'activities',
    'settings',
    'notifications',
    'errors',
    'validation',
  ],

  // Fallback configuration
  FALLBACK_LNG: 'pt-BR',
  DEFAULT_NAMESPACE: 'common',

  // Performance settings
  PERFORMANCE: {
    CACHE_SIZE: 1000,
    LOAD_DELAY: 100, // Debounce translation loading
    PRELOAD_LANGUAGES: ['pt-BR', 'en-US'], // Preload critical languages
  },

  // Pluralization rules
  PLURALIZATION: {
    'pt-BR': (count) => {
      return count === 0 ? 'zero' : count === 1 ? 'one' : 'other';
    },
    'en-US': (count) => {
      return count === 0 ? 'zero' : count === 1 ? 'one' : 'other';
    },
    'es-ES': (count) => {
      return count === 0 ? 'zero' : count === 1 ? 'one' : 'other';
    },
    'fr-FR': (count) => {
      return count === 0 ? 'zero' : count === 1 ? 'one' : 'other';
    },
  },
};

// ============================================
// TRANSLATION UTILITIES
// ============================================

/**
 * Enhanced translation function with caching and performance optimizations
 */
class TranslationManager {
  constructor() {
    this.cache = new Map();
    this.loadPromises = new Map();
    this.loadedNamespaces = new Set();
  }

  /**
   * Get translation with caching
   */
  async getTranslation(language, namespace, key, options = {}) {
    const cacheKey = `${language}_${namespace}_${key}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.interpolate(this.cache.get(cacheKey), options);
    }

    // Load namespace if not loaded
    if (!this.loadedNamespaces.has(`${language}_${namespace}`)) {
      await this.loadNamespace(language, namespace);
    }

    // Get from translations
    const translations = this.getTranslations(language, namespace);
    const translation = this.getNestedValue(translations, key);

    if (translation) {
      this.cache.set(cacheKey, translation);
      return this.interpolate(translation, options);
    }

    // Fallback to default language
    if (language !== I18N_CONFIG.FALLBACK_LNG) {
      return this.getTranslation(I18N_CONFIG.FALLBACK_LNG, namespace, key, options);
    }

    return key; // Return key as fallback
  }

  /**
   * Load namespace translations
   */
  async loadNamespace(language, namespace) {
    const loadKey = `${language}_${namespace}`;

    if (this.loadPromises.has(loadKey)) {
      return this.loadPromises.get(loadKey);
    }

    const loadPromise = this.fetchTranslations(language, namespace)
      .then(translations => {
        this.setTranslations(language, namespace, translations);
        this.loadedNamespaces.add(loadKey);
        this.loadPromises.delete(loadKey);
      })
      .catch(error => {
        console.warn(`Failed to load ${namespace} for ${language}:`, error);
        this.loadPromises.delete(loadKey);
        throw error;
      });

    this.loadPromises.set(loadKey, loadPromise);
    return loadPromise;
  }

  /**
   * Fetch translations from API or file system
   */
  async fetchTranslations(language, namespace) {
    try {
      // In production, this would fetch from API or file system
      const response = await fetch(`/locales/${language}/${namespace}.json`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`Failed to fetch ${namespace} for ${language}:`, error);

      // Return fallback translations
      return this.getFallbackTranslations(namespace);
    }
  }

  /**
   * Get fallback translations when API fails
   */
  getFallbackTranslations(namespace) {
    const fallbacks = {
      common: {
        loading: 'Carregando...',
        error: 'Erro',
        success: 'Sucesso',
        cancel: 'Cancelar',
        save: 'Salvar',
        delete: 'Excluir',
        edit: 'Editar',
        create: 'Criar',
        search: 'Buscar',
        filter: 'Filtrar',
      },
      auth: {
        login: 'Entrar',
        logout: 'Sair',
        register: 'Cadastrar',
        forgotPassword: 'Esqueceu a senha?',
        email: 'E-mail',
        password: 'Senha',
      },
    };

    return fallbacks[namespace] || {};
  }

  /**
   * Set translations in memory
   */
  setTranslations(language, namespace, translations) {
    if (!this.translations) {
      this.translations = {};
    }
    if (!this.translations[language]) {
      this.translations[language] = {};
    }
    this.translations[language][namespace] = translations;
  }

  /**
   * Get translations from memory
   */
  getTranslations(language, namespace) {
    return this.translations?.[language]?.[namespace] || {};
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Interpolate variables in translation
   */
  interpolate(translation, options) {
    if (typeof translation !== 'string') return translation;

    let result = translation;

    // Replace variables like {{variable}}
    Object.entries(options).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    });

    return result;
  }

  /**
   * Handle pluralization
   */
  pluralize(translation, count, options = {}) {
    if (typeof translation !== 'object') return translation;

    const language = options.lng || I18N_CONFIG.FALLBACK_LNG;
    const pluralRule = I18N_CONFIG.PLURALIZATION[language] || (() => 'other');

    const pluralKey = pluralRule(count);
    return translation[pluralKey] || translation.other || translation;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.loadedNamespaces.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      loadedNamespaces: this.loadedNamespaces.size,
      loadPromises: this.loadPromises.size,
    };
  }
}

// Global translation manager instance
export const translationManager = new TranslationManager();

// ============================================
// REACT HOOKS
// ============================================

/**
 * Enhanced useTranslation hook with performance optimizations
 */
export const useTranslation = (namespace = I18N_CONFIG.DEFAULT_NAMESPACE) => {
  const [currentLanguage, setCurrentLanguage] = useState(I18N_CONFIG.FALLBACK_LNG);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Translate function with caching
   */
  const t = useCallback(async (key, options = {}) => {
    const language = options.lng || currentLanguage;
    return translationManager.getTranslation(language, namespace, key, options);
  }, [currentLanguage, namespace]);

  /**
   * Change language
   */
  const changeLanguage = useCallback(async (language) => {
    if (!I18N_CONFIG.LANGUAGES[language]) {
      console.warn(`Language ${language} not supported`);
      return;
    }

    setIsLoading(true);

    try {
      // Preload critical namespaces
      await Promise.all(
        I18N_CONFIG.NAMESPACES.slice(0, 3).map(ns =>
          translationManager.loadNamespace(language, ns)
        )
      );

      setCurrentLanguage(language);

      // Persist language preference
      localStorage.setItem('tamanduai_language', language);

      // Notify other components
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));

    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get pluralized translation
   */
  const tPlural = useCallback(async (key, count, options = {}) => {
    const translation = await t(key, options);

    if (typeof translation === 'object') {
      return translationManager.pluralize(translation, count, { lng: currentLanguage });
    }

    return translation;
  }, [t, currentLanguage]);

  /**
   * Check if translation exists
   */
  const exists = useCallback(async (key, options = {}) => {
    try {
      const translation = await t(key, options);
      return translation !== key; // If translation is different from key, it exists
    } catch {
      return false;
    }
  }, [t]);

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('tamanduai_language');
    if (savedLanguage && savedLanguage !== currentLanguage) {
      changeLanguage(savedLanguage);
    }
  }, []);

  return {
    t,
    tPlural,
    exists,
    currentLanguage,
    changeLanguage,
    isLoading,
    supportedLanguages: I18N_CONFIG.LANGUAGES,
  };
};

/**
 * Hook for translation loading state
 */
export const useTranslationLoading = (namespaces = I18N_CONFIG.NAMESPACES) => {
  const [loadingState, setLoadingState] = useState({});
  const { currentLanguage } = useTranslation();

  useEffect(() => {
    const loadNamespaces = async () => {
      setLoadingState(namespaces.reduce((acc, ns) => ({ ...acc, [ns]: true }), {}));

      try {
        await Promise.all(
          namespaces.map(ns => translationManager.loadNamespace(currentLanguage, ns))
        );
      } catch (error) {
        console.warn('Error loading namespaces:', error);
      } finally {
        setLoadingState(namespaces.reduce((acc, ns) => ({ ...acc, [ns]: false }), {}));
      }
    };

    loadNamespaces();
  }, [currentLanguage, namespaces]);

  return loadingState;
};

/**
 * Hook for translation performance monitoring
 */
export const useTranslationPerformance = () => {
  const [metrics, setMetrics] = useState({
    cacheHits: 0,
    cacheMisses: 0,
    loadTimes: [],
    errorCount: 0,
  });

  useEffect(() => {
    const updateMetrics = () => {
      const stats = translationManager.getCacheStats();
      setMetrics(prev => ({
        ...prev,
        cacheSize: stats.cacheSize,
        loadedNamespaces: stats.loadedNamespaces,
      }));
    };

    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
};

// ============================================
// TRANSLATION COMPONENTS
// ============================================

/**
 * Translation Provider Component
 */
export const TranslationProvider = ({ children, fallbackLanguage = I18N_CONFIG.FALLBACK_LNG }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeTranslations = async () => {
      try {
        // Preload critical languages and namespaces
        await Promise.all(
          I18N_CONFIG.PERFORMANCE.PRELOAD_LANGUAGES.flatMap(language =>
            I18N_CONFIG.NAMESPACES.slice(0, 3).map(namespace =>
              translationManager.loadNamespace(language, namespace)
            )
          )
        );

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing translations:', error);
        setIsInitialized(true); // Continue anyway with fallbacks
      }
    };

    initializeTranslations();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Loading translations...</span>
      </div>
    );
  }

  return children;
};

/**
 * Language Selector Component
 */
export const LanguageSelector = ({ className, variant = 'dropdown' }) => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangConfig = supportedLanguages[currentLanguage];

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-background hover:bg-accent"
        >
          <span>{currentLangConfig?.flag}</span>
          <span className="text-sm">{currentLangConfig?.nativeName}</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-50">
            {Object.entries(supportedLanguages).map(([code, config]) => (
              <button
                key={code}
                onClick={() => {
                  changeLanguage(code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2 ${
                  code === currentLanguage ? 'bg-accent' : ''
                }`}
              >
                <span>{config.flag}</span>
                <span className="text-sm">{config.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Compact variant
  return (
    <div className={`flex gap-1 ${className}`}>
      {Object.entries(supportedLanguages).map(([code, config]) => (
        <button
          key={code}
          onClick={() => changeLanguage(code)}
          className={`p-2 rounded text-sm ${
            code === currentLanguage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-accent'
          }`}
          title={config.name}
        >
          {config.flag}
        </button>
      ))}
    </div>
  );
};

/**
 * Translated Text Component
 */
export const Trans = ({
  i18nKey,
  ns = I18N_CONFIG.DEFAULT_NAMESPACE,
  values,
  count,
  children,
  className,
  ...options
}) => {
  const { t, tPlural } = useTranslation(ns);
  const [translation, setTranslation] = useState('');

  useEffect(() => {
    const loadTranslation = async () => {
      try {
        if (count !== undefined) {
          const pluralTranslation = await tPlural(i18nKey, count, options);
          setTranslation(pluralTranslation);
        } else {
          const simpleTranslation = await t(i18nKey, { ...values, ...options });
          setTranslation(simpleTranslation);
        }
      } catch (error) {
        console.warn('Translation error:', error);
        setTranslation(i18nKey); // Fallback to key
      }
    };

    loadTranslation();
  }, [i18nKey, ns, values, count, options, t, tPlural]);

  return (
    <span className={className}>
      {translation || children || i18nKey}
    </span>
  );
};

/**
 * Pluralized Translation Component
 */
export const Plural = ({
  i18nKey,
  count,
  ns = I18N_CONFIG.DEFAULT_NAMESPACE,
  className,
  ...options
}) => {
  return (
    <Trans
      i18nKey={i18nKey}
      ns={ns}
      count={count}
      className={className}
      {...options}
    />
  );
};

// ============================================
// TRANSLATION UTILITIES
// ============================================

/**
 * Format numbers according to locale
 */
export const formatNumber = (number, locale = I18N_CONFIG.FALLBACK_LNG) => {
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Format dates according to locale
 */
export const formatDate = (date, locale = I18N_CONFIG.FALLBACK_LNG, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(date));
};

/**
 * Format currency according to locale
 */
export const formatCurrency = (amount, currency = 'BRL', locale = I18N_CONFIG.FALLBACK_LNG) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format relative time according to locale
 */
export const formatRelativeTime = (date, locale = I18N_CONFIG.FALLBACK_LNG) => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const diffInMs = date - now;
  const diffInSeconds = Math.floor(diffInMs / 1000);

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(Math.floor(diffInSeconds), 'second');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(diffInYears, 'year');
};

/**
 * Get localized direction (RTL/LTR)
 */
export const getTextDirection = (language = I18N_CONFIG.FALLBACK_LNG) => {
  return I18N_CONFIG.LANGUAGES[language]?.rtl ? 'rtl' : 'ltr';
};

/**
 * Detect user's preferred language
 */
export const detectUserLanguage = () => {
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang && I18N_CONFIG.LANGUAGES[urlLang]) {
    return urlLang;
  }

  // Check localStorage
  const storedLang = localStorage.getItem('tamanduai_language');
  if (storedLang && I18N_CONFIG.LANGUAGES[storedLang]) {
    return storedLang;
  }

  // Check browser language
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang && I18N_CONFIG.LANGUAGES[browserLang]) {
    return browserLang;
  }

  // Check browser language without region
  const langOnly = browserLang?.split('-')[0];
  if (langOnly) {
    for (const [code] of Object.entries(I18N_CONFIG.LANGUAGES)) {
      if (code.startsWith(langOnly)) {
        return code;
      }
    }
  }

  return I18N_CONFIG.FALLBACK_LNG;
};

// ============================================
// EXPORTS
// ============================================

export {
  TranslationProvider,
  LanguageSelector,
  Trans,
  Plural,
  useTranslation,
  useTranslationLoading,
  useTranslationPerformance,
  formatNumber,
  formatDate,
  formatCurrency,
  formatRelativeTime,
  getTextDirection,
  detectUserLanguage,
};

export default useTranslation;
