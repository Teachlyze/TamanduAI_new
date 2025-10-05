// src/config/supabase.js
/**
 * Configuração avançada do Supabase para diferentes ambientes
 */

// Configurações específicas por ambiente
const ENVIRONMENTS = {
  development: {
    name: 'Desenvolvimento',
    debug: true,
    cache: {
      ttl: 30000, // 30 segundos
      maxSize: 50,
    },
    retry: {
      maxAttempts: 3,
      baseDelay: 500,
    },
    monitoring: {
      enabled: true,
      logLevel: 'debug',
    },
  },

  staging: {
    name: 'Homologação',
    debug: false,
    cache: {
      ttl: 300000, // 5 minutos
      maxSize: 200,
    },
    retry: {
      maxAttempts: 4,
      baseDelay: 1000,
    },
    monitoring: {
      enabled: true,
      logLevel: 'info',
    },
  },

  production: {
    name: 'Produção',
    debug: false,
    cache: {
      ttl: 900000, // 15 minutos
      maxSize: 1000,
    },
    retry: {
      maxAttempts: 5,
      baseDelay: 2000,
    },
    monitoring: {
      enabled: true,
      logLevel: 'warn',
    },
  },
};

// Configuração atual baseada no ambiente
const currentEnv = import.meta.env.MODE || 'development';
const envConfig = ENVIRONMENTS[currentEnv] || ENVIRONMENTS.development;

// URLs e chaves do Supabase
const SUPABASE_CONFIG = {
  // URLs oficiais do Supabase
  urls: {
    development: 'https://your-project.supabase.co',
    staging: 'https://your-staging-project.supabase.co',
    production: 'https://your-production-project.supabase.co',
  },

  // Chaves (substituir pelos valores reais)
  keys: {
    development: {
      anon: import.meta.env.VITE_SUPABASE_ANON_KEY,
      service: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    },
    staging: {
      anon: import.meta.env.VITE_SUPABASE_ANON_KEY_STAGING,
      service: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY_STAGING,
    },
    production: {
      anon: import.meta.env.VITE_SUPABASE_ANON_KEY,
      service: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    },
  },
};

// Obter configuração específica do ambiente atual
export function getSupabaseConfig() {
  const keys = SUPABASE_CONFIG.keys[currentEnv];
  const url = SUPABASE_CONFIG.urls[currentEnv];

  if (!url) {
    throw new Error(`URL do Supabase não configurada para ambiente: ${currentEnv}`);
  }

  if (!keys?.anon) {
    throw new Error(`Chave anônima do Supabase não configurada para ambiente: ${currentEnv}`);
  }

  return {
    url,
    anonKey: keys.anon,
    serviceKey: keys.service,
    environment: currentEnv,
    envConfig,
  };
}

// Configuração de conexão otimizada
export const SUPABASE_CONNECTION_CONFIG = {
  // Configurações de autenticação
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : null,
    flowType: 'pkce',
    debug: envConfig.debug,
  },

  // Configurações globais
  global: {
    headers: {
      'X-Client-Info': 'tamanduai-platform',
      'X-Client-Version': process.env.npm_package_version || '1.0.0',
      'X-Environment': currentEnv,
      'X-Client-Timestamp': new Date().toISOString(),
    },
  },

  // Configurações de banco de dados
  db: {
    schema: 'public',
  },

  // Configurações de tempo real
  realtime: {
    params: {
      eventsPerSecond: envConfig.cache.maxSize > 500 ? 5 : 10,
    },
  },

  // Configurações específicas por ambiente
  ...envConfig,
};

// Configuração de cache inteligente
export const CACHE_CONFIG = {
  // Cache de sessão
  session: {
    ttl: envConfig.cache.ttl,
    storageKey: `tamanduai-session-${currentEnv}`,
  },

  // Cache de dados
  data: {
    ttl: envConfig.cache.ttl,
    maxSize: envConfig.cache.maxSize,
    storageKey: `tamanduai-cache-${currentEnv}`,
  },

  // Cache de configurações
  config: {
    ttl: 3600000, // 1 hora
    storageKey: `tamanduai-config-${currentEnv}`,
  },
};

// Configuração de retry e resiliência
export const RETRY_CONFIG = {
  maxAttempts: envConfig.retry.maxAttempts,
  baseDelay: envConfig.retry.baseDelay,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,

  // Status codes que devem ser retried
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],

  // Erros que devem ser retried
  retryableErrors: [
    'NetworkError',
    'TimeoutError',
    'AbortError',
    'TypeError',
  ],
};

// Configuração de monitoramento
export const MONITORING_CONFIG = {
  enabled: envConfig.monitoring.enabled,
  logLevel: envConfig.monitoring.logLevel,

  // Métricas a serem coletadas
  metrics: {
    connection: true,
    performance: true,
    errors: true,
    cache: true,
  },

  // Endpoints de monitoramento (se aplicável)
  endpoints: {
    health: '/api/health',
    metrics: '/api/metrics',
    logs: '/api/logs',
  },
};

// Configuração de segurança
export const SECURITY_CONFIG = {
  // Headers de segurança obrigatórios
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  },

  // Configurações de rate limiting
  rateLimiting: {
    enabled: currentEnv === 'production',
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: currentEnv === 'production' ? 100 : 1000,
  },

  // Sanitização de dados
  sanitization: {
    maxStringLength: 10000,
    allowedHtmlTags: [],
    stripHtml: true,
  },
};

// Configuração de validação
export const VALIDATION_CONFIG = {
  // Validação de emails
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
  },

  // Validação de senhas
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Validação de nomes
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
  },

  // Validação de CPF (Brasil)
  cpf: {
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    validateChecksum: true,
  },
};

// Configuração de upload de arquivos
export const UPLOAD_CONFIG = {
  // Tamanhos máximos por ambiente
  maxFileSize: {
    development: 50 * 1024 * 1024, // 50MB
    staging: 25 * 1024 * 1024,     // 25MB
    production: 10 * 1024 * 1024,  // 10MB
  },

  // Tipos de arquivo permitidos
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],

  // Configurações de imagem
  image: {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 85,
    formats: ['jpeg', 'png', 'webp'],
  },
};

// Configuração de notificações
export const NOTIFICATION_CONFIG = {
  // Configurações de push notifications
  push: {
    enabled: 'serviceWorker' in navigator,
    vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  },

  // Configurações de email
  email: {
    enabled: !!import.meta.env.VITE_EMAIL_SERVICE_KEY,
    provider: import.meta.env.VITE_EMAIL_PROVIDER || 'resend',
  },

  // Configurações de SMS (se aplicável)
  sms: {
    enabled: !!import.meta.env.VITE_SMS_SERVICE_KEY,
    provider: import.meta.env.VITE_SMS_PROVIDER || 'twilio',
  },
};

// Configuração de internacionalização
export const I18N_CONFIG = {
  // Idiomas suportados
  supportedLanguages: ['pt', 'en', 'es'],

  // Idioma padrão
  defaultLanguage: 'pt',

  // Detecção automática
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    lookupLocalStorage: `tamanduai-language-${currentEnv}`,
    caches: ['localStorage'],
  },

  // Recursos de tradução
  resources: {
    pt: { translation: {} },
    en: { translation: {} },
    es: { translation: {} },
  },
};

// Função para validar configuração completa
export function validateSupabaseConfig() {
  const config = getSupabaseConfig();
  const errors = [];
  const warnings = [];

  // Verificar URL
  try {
    new URL(config.url);
  } catch {
    errors.push('URL do Supabase inválida');
  }

  // Verificar chave anônima
  if (!config.anonKey || config.anonKey.length < 100) {
    errors.push('Chave anônima do Supabase inválida ou ausente');
  }

  // Avisos para desenvolvimento
  if (currentEnv === 'development') {
    if (config.serviceKey) {
      warnings.push('Chave de serviço disponível em desenvolvimento - cuidado com exposição');
    }
  }

  // Verificar configurações críticas
  if (currentEnv === 'production') {
    if (!config.serviceKey) {
      warnings.push('Chave de serviço não configurada em produção - funcionalidades administrativas limitadas');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

// Exportar configurações principais
export {
  getSupabaseConfig,
  SUPABASE_CONNECTION_CONFIG,
  CACHE_CONFIG,
  RETRY_CONFIG,
  MONITORING_CONFIG,
  SECURITY_CONFIG,
  VALIDATION_CONFIG,
  UPLOAD_CONFIG,
  NOTIFICATION_CONFIG,
  I18N_CONFIG,
  ENVIRONMENTS,
  currentEnv,
  envConfig,
};

export default getSupabaseConfig;
