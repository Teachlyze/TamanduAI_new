// src/config/appConfig.js
/**
 * Configuração centralizada da aplicação
 * Permite diferentes configurações por ambiente
 */

const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
};

// Configuração padrão compartilhada por todos os ambientes
const DEFAULT_CONFIG = {
  // App Info
  app: {
    name: 'TamanduAI',
    version: '3.0.0',
    description: 'Plataforma Educacional Inteligente',
  },

  // API Configuration
  api: {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Cache Configuration
  cache: {
    defaultTTL: 300, // 5 minutes
    maxSize: 100, // MB
    strategies: {
      memory: true,
      redis: true,
      indexedDB: false,
    },
  },

  // Security Configuration
  security: {
    rateLimiting: {
      enabled: true,
      maxAttempts: 5,
      windowMs: 900000, // 15 minutes
    },
    sessionTimeout: 3600000, // 1 hour
    requireCaptcha: true,
  },

  // Monitoring Configuration
  monitoring: {
    enabled: true,
    sampleRate: 1.0, // 100% sampling in production
    errorReporting: true,
    performanceTracking: true,
  },

  // UI Configuration
  ui: {
    theme: 'auto',
    animations: true,
    loadingStates: true,
    errorBoundaries: true,
  },

  // Feature Flags
  features: {
    advancedAnalytics: true,
    plagiarismDetection: true,
    realTimeCollaboration: true,
    offlineSupport: true,
    pushNotifications: true,
    aiChatbot: true,
  },
};

// Configurações específicas por ambiente
const ENVIRONMENT_CONFIGS = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    api: {
      baseURL: 'http://localhost:3000',
      timeout: 30000, // Mais tempo para desenvolvimento
    },

    cache: {
      defaultTTL: 60, // 1 minute para desenvolvimento
      strategies: {
        memory: true,
        redis: false, // Desabilitar Redis em dev
        indexedDB: false,
      },
    },

    security: {
      requireCaptcha: false, // Desabilitar captcha em desenvolvimento
      rateLimiting: {
        enabled: false,
      },
    },

    monitoring: {
      sampleRate: 0.1, // 10% sampling em desenvolvimento
      errorReporting: false,
    },

    features: {
      ...DEFAULT_CONFIG.features,
      // Desabilitar features pesadas em desenvolvimento
      advancedAnalytics: false,
    },

    debug: {
      enabled: true,
      showDevTools: true,
      logLevel: 'debug',
    },
  },

  [ENVIRONMENTS.STAGING]: {
    api: {
      baseURL: import.meta.env.VITE_SUPABASE_URL,
      timeout: 15000,
    },

    cache: {
      defaultTTL: 180, // 3 minutes
      strategies: {
        memory: true,
        redis: true,
        indexedDB: true,
      },
    },

    security: {
      requireCaptcha: true,
      rateLimiting: {
        enabled: true,
      },
    },

    monitoring: {
      sampleRate: 0.5, // 50% sampling em staging
      errorReporting: true,
    },

    features: {
      ...DEFAULT_CONFIG.features,
    },

    debug: {
      enabled: false,
      showDevTools: false,
      logLevel: 'warn',
    },
  },

  [ENVIRONMENTS.PRODUCTION]: {
    api: {
      baseURL: import.meta.env.VITE_SUPABASE_URL,
      timeout: 10000,
    },

    cache: {
      defaultTTL: 300, // 5 minutes
      strategies: {
        memory: true,
        redis: true,
        indexedDB: true,
      },
    },

    security: {
      requireCaptcha: true,
      rateLimiting: {
        enabled: true,
        maxAttempts: 3, // Mais restritivo em produção
        windowMs: 600000, // 10 minutes
      },
    },

    monitoring: {
      sampleRate: 1.0, // 100% em produção
      errorReporting: true,
    },

    features: {
      ...DEFAULT_CONFIG.features,
    },

    debug: {
      enabled: false,
      showDevTools: false,
      logLevel: 'error',
    },
  },
};

// Detectar ambiente atual
const getCurrentEnvironment = () => {
  if (typeof window !== 'undefined') {
    // Client-side detection
    if (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1') {
      return ENVIRONMENTS.DEVELOPMENT;
    }

    if (window.location.hostname.includes('staging') ||
        window.location.hostname.includes('dev')) {
      return ENVIRONMENTS.STAGING;
    }
  }

  // Default to production for server-side or unknown environments
  return ENVIRONMENTS.PRODUCTION;
};

// Obter configuração atual
const getAppConfig = () => {
  const environment = getCurrentEnvironment();
  const envConfig = ENVIRONMENT_CONFIGS[environment] || {};

  // Merge configurações: default + environment specific + runtime overrides
  const config = {
    ...DEFAULT_CONFIG,
    ...envConfig,
    environment,
  };

  // Adicionar configurações de runtime se disponíveis
  if (typeof window !== 'undefined') {
    config.runtime = {
      isOnline: navigator.onLine,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      timestamp: new Date().toISOString(),
    };
  }

  return config;
};

// Hook para usar configuração no React
export const useAppConfig = () => {
  const [config, setConfig] = React.useState(getAppConfig());

  React.useEffect(() => {
    // Atualizar configuração quando ambiente mudar
    const handleOnlineStatus = () => {
      setConfig(prev => ({
        ...prev,
        runtime: {
          ...prev.runtime,
          isOnline: navigator.onLine,
        },
      }));
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  return config;
};

// Função utilitária para verificar se uma feature está habilitada
export const isFeatureEnabled = (featureName) => {
  const config = getAppConfig();
  return config.features[featureName] === true;
};

// Função utilitária para obter configuração específica
export const getConfigValue = (path) => {
  const config = getAppConfig();
  return path.split('.').reduce((obj, key) => obj?.[key], config);
};

// Função para validar configuração
export const validateConfig = () => {
  const config = getAppConfig();
  const errors = [];

  // Validar configurações críticas
  if (!config.api.baseURL) {
    errors.push('API baseURL is required');
  }

  if (config.security.requireCaptcha && !import.meta.env.VITE_HCAPTCHA_SITE_KEY) {
    errors.push('hCaptcha site key is required when captcha is enabled');
  }

  if (config.cache.strategies.redis && !import.meta.env.UPSTASH_REDIS_REST_URL) {
    errors.push('Redis URL is required when Redis cache is enabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Exportar constantes e funções
export {
  ENVIRONMENTS,
  DEFAULT_CONFIG,
  ENVIRONMENT_CONFIGS,
  getCurrentEnvironment,
  getAppConfig,
};

// Exportar configuração padrão para uso direto
export default getAppConfig();
