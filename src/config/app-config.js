/**
 * Environment Configuration for TamanduAI Platform
 * Centralized configuration management for different environments
 */

// ============================================
// ENVIRONMENT DETECTION
// ============================================

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
};

export const getCurrentEnvironment = () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    return import.meta.env.MODE || 'development';
  }

  // Node.js environment
  return process.env.NODE_ENV || 'development';
};

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURE_FLAGS = {
  // Development features
  DEBUG_MODE: getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT,
  PERFORMANCE_MONITORING: getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT,

  // Authentication features
  ENABLE_CAPTCHA: true,
  ENABLE_TWO_FACTOR_AUTH: false,
  ENABLE_SOCIAL_LOGIN: true,

  // UI features
  ENABLE_DARK_MODE: true,
  ENABLE_ANIMATIONS: true,
  ENABLE_ACCESSIBILITY_FEATURES: true,

  // API features
  ENABLE_API_CACHE: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_REAL_TIME_UPDATES: true,

  // Analytics features
  ENABLE_ANALYTICS: getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION,
  ENABLE_ERROR_TRACKING: true,

  // Development tools
  ENABLE_REACT_DEVTOOLS: getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT,
  ENABLE_REDUX_DEVTOOLS: getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT,
};

// ============================================
// API CONFIGURATION
// ============================================

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // Rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 100,
    REQUESTS_PER_HOUR: 1000,
  },

  // Endpoints
  ENDPOINTS: {
    AUTH: '/auth',
    USERS: '/users',
    CLASSES: '/classes',
    ACTIVITIES: '/activities',
    SUBMISSIONS: '/submissions',
    NOTIFICATIONS: '/notifications',
    ANALYTICS: '/analytics',
    UPLOADS: '/uploads',
  },
};

// ============================================
// DATABASE CONFIGURATION
// ============================================

export const DB_CONFIG = {
  // Supabase configuration
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL,
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  },

  // Cache settings
  CACHE: {
    ENABLED: FEATURE_FLAGS.ENABLE_API_CACHE,
    DEFAULT_TTL: parseInt(import.meta.env.VITE_CACHE_TTL_MINUTES || '5') * 60 * 1000, // minutos para ms
    MAX_SIZE: parseInt(import.meta.env.VITE_MAX_CACHE_ENTRIES || '100'), // Maximum cache entries
  },

  // Query settings
  QUERY: {
    DEFAULT_LIMIT: parseInt(import.meta.env.VITE_DEFAULT_QUERY_LIMIT || '50'),
    MAX_LIMIT: parseInt(import.meta.env.VITE_MAX_QUERY_LIMIT || '1000'),
    DEFAULT_OFFSET: 0,
  },
};

// ============================================
// AUTHENTICATION CONFIGURATION
// ============================================

export const AUTH_CONFIG = {
  // Provider settings
  PROVIDERS: {
    GOOGLE: {
      ENABLED: FEATURE_FLAGS.ENABLE_SOCIAL_LOGIN,
      CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    },
    GITHUB: {
      ENABLED: FEATURE_FLAGS.ENABLE_SOCIAL_LOGIN,
      CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID,
    },
  },

  // Session settings
  SESSION: {
    STORAGE_KEY: 'tamanduai_session',
    REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
    MAX_INACTIVE_TIME: 30 * 60 * 1000, // 30 minutes
  },

  // Security settings
  SECURITY: {
    ENABLE_CAPTCHA: FEATURE_FLAGS.ENABLE_CAPTCHA,
    CAPTCHA_SITE_KEY: import.meta.env.VITE_HCAPTCHA_SITE_KEY,
    ENABLE_RATE_LIMITING: import.meta.env.VITE_ENABLE_RATE_LIMITING === 'true',
    MAX_LOGIN_ATTEMPTS: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'),
    LOCKOUT_DURATION: parseInt(import.meta.env.VITE_LOCKOUT_DURATION_MINUTES || '15') * 60 * 1000, // minutos para ms
  },
};

// ============================================
// UI CONFIGURATION
// ============================================

export const UI_CONFIG = {
  // Theme settings
  THEME: {
    DEFAULT_THEME: 'system',
    STORAGE_KEY: 'tamanduai_theme',
    ENABLE_SYSTEM_THEME: true,
  },

  // Layout settings
  LAYOUT: {
    SIDEBAR_WIDTH: parseInt(import.meta.env.VITE_SIDEBAR_WIDTH || '280'),
    HEADER_HEIGHT: parseInt(import.meta.env.VITE_HEADER_HEIGHT || '64'),
    FOOTER_HEIGHT: 0,
    CONTENT_MAX_WIDTH: parseInt(import.meta.env.VITE_CONTENT_MAX_WIDTH || '1200'),
    MOBILE_BREAKPOINT: parseInt(import.meta.env.VITE_MOBILE_BREAKPOINT || '768'),
    TABLET_BREAKPOINT: parseInt(import.meta.env.VITE_TABLET_BREAKPOINT || '1024'),
  },

  // Animation settings
  ANIMATIONS: {
    ENABLED: FEATURE_FLAGS.ENABLE_ANIMATIONS,
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
    EASING: {
      DEFAULT: 'ease-in-out',
      BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Toast settings
  TOAST: {
    DEFAULT_DURATION: 5000,
    MAX_TOASTS: 5,
    POSITION: 'top-center',
  },
};

// ============================================
// ANALYTICS CONFIGURATION
// ============================================

export const ANALYTICS_CONFIG = {
  ENABLED: FEATURE_FLAGS.ENABLE_ANALYTICS,

  // Google Analytics
  GOOGLE_ANALYTICS: {
    TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
    ENABLED: FEATURE_FLAGS.ENABLE_ANALYTICS,
  },

  // Custom analytics
  CUSTOM: {
    ENDPOINT: '/analytics/events',
    BATCH_SIZE: 10,
    FLUSH_INTERVAL: 30000, // 30 seconds
  },

  // Error tracking
  ERROR_TRACKING: {
    ENABLED: FEATURE_FLAGS.ENABLE_ERROR_TRACKING,
    SAMPLE_RATE: 1.0, // 100% in development, adjust for production
  },
};

// ============================================
// DEVELOPMENT CONFIGURATION
// ============================================

export const DEV_CONFIG = {
  ENABLE_HOT_RELOAD: getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT,
  ENABLE_ERROR_OVERLAY: getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT,
  ENABLE_SOURCE_MAPS: getCurrentEnvironment() !== ENVIRONMENTS.PRODUCTION,

  // Logging
  LOGGING: {
    LEVEL: getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION ? 'warn' : 'debug',
    ENABLE_CONSOLE_LOGGING: true,
    ENABLE_REMOTE_LOGGING: FEATURE_FLAGS.ENABLE_ERROR_TRACKING,
  },

  // Mock data
  MOCK: {
    ENABLED: getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT,
    API_DELAY: parseInt(import.meta.env.VITE_MOCK_API_DELAY || '500'), // Simulate API delay in development
  },
};

// ============================================
// PERFORMANCE CONFIGURATION
// ============================================

export const PERFORMANCE_CONFIG = {
  // Bundle optimization
  BUNDLE: {
    CODE_SPLITTING: true,
    LAZY_LOADING: true,
    TREE_SHAKING: true,
    MINIFICATION: getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION,
  },

  // Caching
  CACHE: {
    ENABLE_SERVICE_WORKER: getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION,
    CACHE_STRATEGY: 'stale-while-revalidate',
    MAX_CACHE_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Images
  IMAGES: {
    LAZY_LOADING: true,
    WEBP_SUPPORT: true,
    RESPONSIVE_IMAGES: true,
    PLACEHOLDER: 'blur',
  },

  // Monitoring
  MONITORING: {
    ENABLE_WEB_VITALS: FEATURE_FLAGS.PERFORMANCE_MONITORING,
    ENABLE_PERFORMANCE_OBSERVER: FEATURE_FLAGS.PERFORMANCE_MONITORING,
    TRACK_USER_TIMING: true,
  },
};

// ============================================
// INTERNATIONALIZATION
// ============================================

export const I18N_CONFIG = {
  DEFAULT_LOCALE: 'pt-BR',
  FALLBACK_LOCALE: 'en-US',
  SUPPORTED_LOCALES: ['pt-BR', 'en-US', 'es-ES'],
  STORAGE_KEY: 'tamanduai_locale',

  // Translation loading
  LOAD_PATH: '/locales/{{lng}}/{{ns}}.json',
  NAMESPACES: ['common', 'auth', 'dashboard', 'activities', 'settings'],
};

// ============================================
// EXPORT CONFIGURATION OBJECT
// ============================================

export const APP_CONFIG = {
  ENV: getCurrentEnvironment(),
  IS_DEVELOPMENT: getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT,
  IS_PRODUCTION: getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION,
  IS_TEST: getCurrentEnvironment() === ENVIRONMENTS.TEST,

  // Feature flags
  FEATURES: FEATURE_FLAGS,

  // API configuration
  API: API_CONFIG,

  // Database configuration
  DB: DB_CONFIG,

  // Authentication configuration
  AUTH: AUTH_CONFIG,

  // UI configuration
  UI: UI_CONFIG,

  // Analytics configuration
  ANALYTICS: ANALYTICS_CONFIG,

  // Development configuration
  DEV: DEV_CONFIG,

  // Performance configuration
  PERFORMANCE: PERFORMANCE_CONFIG,

  // Internationalization configuration
  I18N: I18N_CONFIG,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get configuration value with environment-specific overrides
 */
export const getConfig = (path, defaultValue = null) => {
  const keys = path.split('.');
  let config = APP_CONFIG;

  for (const key of keys) {
    if (config && typeof config === 'object' && key in config) {
      config = config[key];
    } else {
      return defaultValue;
    }
  }

  return config;
};

/**
 * Check if a feature flag is enabled
 */
export const isFeatureEnabled = (feature) => {
  return FEATURE_FLAGS[feature] || false;
};

/**
 * Get environment-specific configuration
 */
export const getEnvConfig = (environment = getCurrentEnvironment()) => {
  switch (environment) {
    case ENVIRONMENTS.DEVELOPMENT:
      return {
        ...APP_CONFIG,
        API: {
          ...API_CONFIG,
          BASE_URL: 'http://localhost:3001',
        },
        DEV: {
          ...DEV_CONFIG,
          LOGGING: {
            ...DEV_CONFIG.LOGGING,
            LEVEL: 'debug',
          },
        },
      };

    case ENVIRONMENTS.STAGING:
      return {
        ...APP_CONFIG,
        API: {
          ...API_CONFIG,
          BASE_URL: import.meta.env.VITE_STAGING_API_URL || 'https://api-staging.tamanduai.com',
        },
        ANALYTICS: {
          ...ANALYTICS_CONFIG,
          ENABLED: true,
        },
      };

    case ENVIRONMENTS.PRODUCTION:
      return {
        ...APP_CONFIG,
        API: {
          ...API_CONFIG,
          BASE_URL: import.meta.env.VITE_PRODUCTION_API_URL || 'https://api.tamanduai.com',
        },
        PERFORMANCE: {
          ...PERFORMANCE_CONFIG,
          CACHE: {
            ...PERFORMANCE_CONFIG.CACHE,
            ENABLE_SERVICE_WORKER: true,
          },
        },
      };

    default:
      return APP_CONFIG;
  }
};

export default APP_CONFIG;
