// src/config/optimization.js
/**
 * Configurações avançadas de otimização para produção
 */

// Configurações específicas por ambiente
export const OPTIMIZATION_CONFIG = {
  development: {
    // Otimizações para desenvolvimento
    bundleAnalysis: false,
    sourceMaps: true,
    hotReload: true,
    performanceMonitoring: false,
    debugInfo: true,

    // Cache reduzido para desenvolvimento
    cache: {
      maxSize: 50,
      ttl: 30000, // 30 segundos
    },

    // Build mais rápido
    build: {
      minify: false,
      treeShaking: false,
      codeSplitting: false,
    },
  },

  staging: {
    // Otimizações intermediárias
    bundleAnalysis: true,
    sourceMaps: true,
    hotReload: false,
    performanceMonitoring: true,
    debugInfo: false,

    cache: {
      maxSize: 200,
      ttl: 300000, // 5 minutos
    },

    build: {
      minify: true,
      treeShaking: true,
      codeSplitting: true,
    },
  },

  production: {
    // Otimizações máximas para produção
    bundleAnalysis: true,
    sourceMaps: false,
    hotReload: false,
    performanceMonitoring: true,
    debugInfo: false,

    // Cache otimizado para produção
    cache: {
      maxSize: 1000,
      ttl: 900000, // 15 minutos
    },

    // Build totalmente otimizado
    build: {
      minify: true,
      treeShaking: true,
      codeSplitting: true,
      compression: true,
      deadCodeElimination: true,
    },

    // Recursos de produção
    features: {
      serviceWorker: true,
      pwa: true,
      analytics: true,
      errorTracking: true,
      performanceMonitoring: true,
    },
  },
};

// Configuração atual baseada no ambiente
const currentEnv = import.meta.env.MODE || 'development';
export const optimizationConfig = OPTIMIZATION_CONFIG[currentEnv];

// Estratégias de code splitting
export const CODE_SPLITTING_CONFIG = {
  // Componentes que devem ser carregados sob demanda
  lazyComponents: [
    'Dashboard',
    'ActivityBuilder',
    'ClassManagement',
    'Gradebook',
    'Reports',
    'Settings',
    'Profile',
    'Notifications',
  ],

  // Bibliotecas externas para carregamento sob demanda
  externalLibraries: [
    'react-quill', // Editor de texto rico
    'react-chartjs-2', // Gráficos
    'react-pdf', // Visualizador de PDF
    'react-dropzone', // Upload de arquivos
    'framer-motion', // Animações avançadas
  ],

  // Páginas que podem ser pré-carregadas
  preloadPages: [
    '/dashboard',
    '/login',
    '/onboarding',
  ],

  // Recursos críticos para pré-carregamento
  criticalResources: [
    '/fonts/inter-var.woff2',
    '/icons/sprite.svg',
    '/manifest.json',
  ],
};

// Configuração de bundle analysis
export const BUNDLE_ANALYSIS_CONFIG = {
  enabled: optimizationConfig.bundleAnalysis,
  outputFile: 'dist/bundle-analysis.html',
  excludePatterns: [
    'node_modules/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.stories.*',
  ],
  metrics: [
    'totalSize',
    'gzippedSize',
    'parsedSize',
    'cacheability',
    'duplicates',
  ],
};

// Configuração de performance monitoring
export const PERFORMANCE_MONITORING_CONFIG = {
  enabled: optimizationConfig.performanceMonitoring,

  // Métricas a serem coletadas
  metrics: {
    webVitals: true,
    customMetrics: true,
    resourceTiming: true,
    navigationTiming: true,
  },

  // Thresholds para alertas
  thresholds: {
    lcp: 2500, // Largest Contentful Paint
    fid: 100,  // First Input Delay
    cls: 0.1,  // Cumulative Layout Shift
    fcp: 1800, // First Contentful Paint
    ttfb: 800, // Time to First Byte
  },

  // Configurações de amostragem
  sampling: {
    webVitals: 1.0, // 100% para métricas críticas
    customMetrics: 0.1, // 10% para métricas customizadas
  },
};

// Configuração de Service Worker avançado
export const SERVICE_WORKER_CONFIG = {
  enabled: optimizationConfig.features?.serviceWorker,

  // Estratégias de cache
  cacheStrategies: {
    // Recursos críticos - Cache First
    critical: {
      strategy: 'cacheFirst',
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
    },

    // APIs - Network First com fallback
    api: {
      strategy: 'networkFirst',
      maxEntries: 100,
      maxAgeSeconds: 60 * 5, // 5 minutos
      fallback: 'offline',
    },

    // Imagens - Cache First com atualização em background
    images: {
      strategy: 'cacheFirst',
      maxEntries: 200,
      maxAgeSeconds: 60 * 60 * 24 * 7, // 7 dias
    },

    // Assets estáticos - Stale While Revalidate
    assets: {
      strategy: 'staleWhileRevalidate',
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
    },
  },

  // Páginas para cache offline
  offlinePages: [
    '/',
    '/login',
    '/dashboard',
    '/offline',
  ],

  // Configurações de push notifications
  pushNotifications: {
    enabled: true,
    vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    subscriptionEndpoint: '/api/push/subscribe',
  },
};

// Configuração de PWA
export const PWA_CONFIG = {
  enabled: optimizationConfig.features?.pwa,

  manifest: {
    name: 'TamanduAI - Plataforma Educacional',
    short_name: 'TamanduAI',
    description: 'Plataforma educacional com IA para professores e alunos',
    theme_color: '#16A34A',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },

  // Recursos para instalação offline
  offlineResources: [
    '/offline.html',
    '/offline.css',
    '/offline.js',
  ],
};

// Configuração de segurança avançada
export const ADVANCED_SECURITY_CONFIG = {
  // Content Security Policy avançada
  csp: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://hcaptcha.com',
      'https://js.hcaptcha.com',
      'https://*.supabase.co',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:',
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:',
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://api.gowinston.ai',
      'https://*.upstash.io',
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
  },

  // Headers de segurança adicionais
  securityHeaders: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
    'Expect-CT': 'max-age=86400, enforce',
  },

  // Configurações de rate limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: optimizationConfig.cache.maxSize > 500 ? 100 : 200,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
};

// Configuração de internacionalização avançada
export const ADVANCED_I18N_CONFIG = {
  // Detecção de idioma aprimorada
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag', 'cookie', 'header'],
    lookupLocalStorage: `tamanduai-language-${currentEnv}`,
    lookupCookie: 'tamanduai-language',
    lookupHeader: 'accept-language',
    caches: ['localStorage', 'cookie'],
  },

  // Recursos de tradução com lazy loading
  resources: {
    pt: () => import('../i18n/locales/pt.json'),
    en: () => import('../i18n/locales/en.json'),
    es: () => import('../i18n/locales/es.json'),
  },

  // Configurações de fallback
  fallbackLng: 'pt',
  fallbackNS: 'common',

  // Otimizações de performance
  react: {
    useSuspense: true,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
  },

  // Configurações de formatação
  interpolation: {
    escapeValue: false,
    format: (value, format, lng) => {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'currency') return new Intl.NumberFormat(lng, { style: 'currency', currency: 'BRL' }).format(value);
      return value;
    },
  },
};

// Configuração de testes avançada
export const ADVANCED_TESTING_CONFIG = {
  // Configurações de cobertura
  coverage: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
    exclude: [
      'src/test/**',
      'src/**/*.test.*',
      'src/**/*.spec.*',
      'src/**/*.stories.*',
      '**/*.d.ts',
      'src/config/**',
      'src/types/**',
    ],
  },

  // Configurações de performance para testes
  testTimeout: 10000,
  setupFilesAfterEnv: ['./src/test/setup.js'],

  // Configurações de CI/CD
  ci: {
    collectCoverage: true,
    coverageReporters: ['text', 'lcov', 'html', 'json'],
    coverageDirectory: 'coverage',
    testResultsProcessor: 'jest-junit',
  },
};

// Configuração de linting avançada
export const ADVANCED_LINTING_CONFIG = {
  // ESLint configurações aprimoradas
  eslint: {
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:import/recommended',
      'plugin:import/typescript',
    ],
    rules: {
      // Regras específicas para projeto
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-hooks/exhaustive-deps': 'warn',
      'import/order': ['error', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'] }],
      'no-console': currentEnv === 'production' ? 'error' : 'warn',
    },
  },

  // Prettier configuração
  prettier: {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
  },

  // Husky hooks
  husky: {
    hooks: {
      'pre-commit': 'npm run lint && npm run test:run',
      'pre-push': 'npm run test:coverage && npm run build',
    },
  },
};

// Configuração de CI/CD
export const CI_CD_CONFIG = {
  // Pipelines para diferentes ambientes
  pipelines: {
    development: {
      trigger: ['push', 'pull_request'],
      stages: ['install', 'lint', 'test', 'build', 'deploy-dev'],
    },

    staging: {
      trigger: ['push'],
      branches: ['main'],
      stages: ['install', 'lint', 'test', 'build', 'deploy-staging'],
    },

    production: {
      trigger: ['push'],
      branches: ['release'],
      stages: ['install', 'lint', 'test', 'build', 'test-e2e', 'deploy-production'],
    },
  },

  // Configurações de deploy
  deploy: {
    development: {
      environment: 'development',
      autoDeploy: true,
      healthCheck: 'http://localhost:3000/health',
    },

    staging: {
      environment: 'staging',
      autoDeploy: true,
      healthCheck: 'https://staging.tamanduai.com/health',
      backup: true,
    },

    production: {
      environment: 'production',
      autoDeploy: false, // Deploy manual para produção
      healthCheck: 'https://tamanduai.com/health',
      backup: true,
      monitoring: true,
    },
  },

  // Notificações
  notifications: {
    slack: {
      enabled: true,
      webhook: import.meta.env.VITE_SLACK_WEBHOOK,
      channels: {
        development: '#dev-alerts',
        staging: '#staging-alerts',
        production: '#prod-alerts',
      },
    },

    email: {
      enabled: currentEnv === 'production',
      recipients: ['devops@tamanduai.com', 'cto@tamanduai.com'],
    },
  },
};

// Função para aplicar otimizações baseadas no ambiente
export function applyEnvironmentOptimizations() {
  if (typeof window === 'undefined') return;

  const config = optimizationConfig;

  // Aplicar configurações específicas
  if (config.debugInfo) {
    console.log('🔧 Development mode optimizations applied');
  }

  if (config.performanceMonitoring) {
    // Inicializar monitoramento de performance
    import('../services/performanceOptimizer.jsx').then(({ performanceOptimizer }) => {
      performanceOptimizer.startMonitoring();
    });
  }

  if (config.bundleAnalysis) {
    // Log de informações de bundle para análise
    console.log('📦 Bundle analysis enabled');
  }

  // Aplicar configurações de segurança
  if (currentEnv === 'production') {
    console.log('🔒 Production security optimizations applied');
  }
}

// Aplicar otimizações automaticamente
if (typeof window !== 'undefined') {
  applyEnvironmentOptimizations();
}

export {
  CODE_SPLITTING_CONFIG,
  BUNDLE_ANALYSIS_CONFIG,
  PERFORMANCE_MONITORING_CONFIG,
  SERVICE_WORKER_CONFIG,
  PWA_CONFIG,
  ADVANCED_SECURITY_CONFIG,
  ADVANCED_I18N_CONFIG,
  ADVANCED_TESTING_CONFIG,
  ADVANCED_LINTING_CONFIG,
  CI_CD_CONFIG,
};
