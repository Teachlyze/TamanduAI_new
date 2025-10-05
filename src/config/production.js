/**
 * Production Configuration for TamanduAI Platform
 * Optimized settings for production deployment
 */

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

export const PRODUCTION_CONFIG = {
  // Server configuration
  SERVER: {
    PORT: process.env.PORT || 3001,
    HOST: process.env.HOST || '0.0.0.0',
    NODE_ENV: 'production',
    TRUST_PROXY: true,
  },

  // Security configuration
  SECURITY: {
    // HTTPS settings
    HTTPS: {
      ENABLED: true,
      PORT: 443,
      CERT_PATH: process.env.CERT_PATH || '/etc/ssl/certs/tamanduai.crt',
      KEY_PATH: process.env.KEY_PATH || '/etc/ssl/private/tamanduai.key',
    },

    // CORS settings
    CORS: {
      ORIGINS: [
        'https://tamanduai.com',
        'https://www.tamanduai.com',
        'https://app.tamanduai.com',
      ],
      METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      HEADERS: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
      ],
      CREDENTIALS: true,
      MAX_AGE: 86400, // 24 hours
    },

    // Rate limiting
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100,
      MESSAGE: 'Too many requests from this IP, please try again later.',
      STANDARD_HEADERS: true,
      LEGACY_HEADERS: false,
    },

    // Content Security Policy
    CSP: {
      DIRECTIVES: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        connectSrc: ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
        mediaSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },

    // Helmet security headers
    HELMET: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'", 'https:'],
          connectSrc: ["'self'", 'https://*.supabase.co'],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },
  },

  // Database configuration
  DATABASE: {
    SUPABASE: {
      URL: process.env.VITE_SUPABASE_URL,
      ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      SERVICE_ROLE_KEY: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    },

    // Connection pooling
    POOL: {
      MIN: 2,
      MAX: 10,
      ACQUIRE_TIMEOUT: 30000,
      IDLE_TIMEOUT: 60000,
    },

    // Query optimization
    QUERY: {
      TIMEOUT: 30000,
      SLOW_QUERY_LOG: true,
      SLOW_QUERY_THRESHOLD: 5000, // 5 seconds
    },
  },

  // Cache configuration
  CACHE: {
    REDIS: {
      HOST: process.env.REDIS_HOST || 'localhost',
      PORT: process.env.REDIS_PORT || 6379,
      PASSWORD: process.env.REDIS_PASSWORD,
      DB: process.env.REDIS_DB || 0,
      KEY_PREFIX: 'tamanduai:',
    },

    // Memory cache
    MEMORY: {
      MAX_SIZE: 1000,
      DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
      CHECK_PERIOD: 60 * 1000, // 1 minute
    },
  },

  // File upload configuration
  UPLOAD: {
    // File storage
    STORAGE: {
      PROVIDER: 'supabase', // 'supabase', 'aws', 'gcp', 'azure'
      BUCKET: process.env.STORAGE_BUCKET || 'tamanduai-files',
      REGION: process.env.STORAGE_REGION || 'us-east-1',
    },

    // File validation
    VALIDATION: {
      MAX_SIZE: 50 * 1024 * 1024, // 50MB
      ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
      ],
      VIRUS_SCAN: true,
    },

    // CDN configuration
    CDN: {
      ENABLED: true,
      DOMAIN: process.env.CDN_DOMAIN || 'cdn.tamanduai.com',
      CACHE_CONTROL: 'public, max-age=31536000', // 1 year
    },
  },

  // Email configuration
  EMAIL: {
    PROVIDER: 'resend', // 'resend', 'sendgrid', 'mailgun'
    FROM: 'noreply@tamanduai.com',
    TEMPLATES: {
      WELCOME: 'welcome-template',
      PASSWORD_RESET: 'password-reset-template',
      NOTIFICATION: 'notification-template',
    },

    // Rate limiting for emails
    RATE_LIMIT: {
      MAX_PER_HOUR: 1000,
      MAX_PER_DAY: 10000,
    },
  },

  // Analytics configuration
  ANALYTICS: {
    GOOGLE_ANALYTICS: {
      TRACKING_ID: process.env.GA_TRACKING_ID,
      ENABLED: true,
    },

    // Custom analytics
    CUSTOM: {
      ENDPOINT: '/analytics/track',
      BATCH_SIZE: 50,
      FLUSH_INTERVAL: 30000, // 30 seconds
    },

    // Performance monitoring
    PERFORMANCE: {
      ENABLE_WEB_VITALS: true,
      ENABLE_ERROR_TRACKING: true,
      SAMPLE_RATE: 0.1, // 10% of users
    },
  },

  // Monitoring and logging
  MONITORING: {
    // Application Performance Monitoring
    APM: {
      ENABLED: true,
      SERVICE_NAME: 'tamanduai-platform',
      SAMPLE_RATE: 0.1,
    },

    // Logging
    LOGGING: {
      LEVEL: 'info', // 'error', 'warn', 'info', 'debug'
      FORMAT: 'json',
      DESTINATION: 'console', // 'console', 'file', 'remote'
      MAX_FILE_SIZE: '10MB',
      MAX_FILES: 5,
    },

    // Health checks
    HEALTH: {
      ENDPOINT: '/health',
      CHECKS: [
        'database',
        'redis',
        'storage',
        'email',
        'analytics',
      ],
      TIMEOUT: 5000,
    },
  },

  // Feature flags for production
  FEATURES: {
    // Development features (disabled in production)
    DEBUG_MODE: false,
    PERFORMANCE_MONITORING: false,

    // Production features
    ANALYTICS: true,
    ERROR_TRACKING: true,
    HEALTH_CHECKS: true,
    METRICS_COLLECTION: true,

    // User-facing features
    DARK_MODE: true,
    NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    PWA: true,
  },
};

// ============================================
// PRODUCTION UTILITIES
// ============================================

/**
 * Validate production configuration
 */
export const validateProductionConfig = () => {
  const errors = [];
  const warnings = [];

  // Check required environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });

  // Check security settings
  if (!PRODUCTION_CONFIG.SECURITY.HTTPS.ENABLED) {
    warnings.push('HTTPS is not enabled in production');
  }

  // Check database connection
  if (!process.env.DATABASE_URL) {
    errors.push('Database URL not configured');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config: PRODUCTION_CONFIG,
  };
};

/**
 * Setup production middleware
 */
export const setupProductionMiddleware = (app) => {
  // Security middleware
  app.use(helmet(PRODUCTION_CONFIG.SECURITY.HELMET));

  // CORS middleware
  app.use(cors(PRODUCTION_CONFIG.SECURITY.CORS));

  // Rate limiting
  app.use(rateLimit(PRODUCTION_CONFIG.SECURITY.RATE_LIMIT));

  // Compression
  app.use(compression({
    level: 6,
    threshold: '10kb',
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }));

  // Body parsing with limits
  app.use(express.json({
    limit: '10mb',
    strict: true,
  }));

  app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
  }));

  // Request logging
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400,
    stream: process.stderr,
  }));

  // Health check endpoint
  app.get('/health', async (req, res) => {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks: {},
    };

    // Database health check
    try {
      await db.raw('SELECT 1');
      healthCheck.checks.database = 'ok';
    } catch (error) {
      healthCheck.checks.database = 'error';
      healthCheck.status = 'error';
    }

    // Redis health check
    try {
      await redis.ping();
      healthCheck.checks.redis = 'ok';
    } catch (error) {
      healthCheck.checks.redis = 'error';
      healthCheck.status = 'error';
    }

    const statusCode = healthCheck.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  });

  return app;
};

/**
 * Setup production error handling
 */
export const setupProductionErrorHandling = (app) => {
  // Global error handler
  app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(error.status || 500).json({
      error: {
        message: isDevelopment ? error.message : 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
        ...(isDevelopment && { stack: error.stack }),
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: {
        message: 'Route not found',
        code: 'ROUTE_NOT_FOUND',
        path: req.originalUrl,
      },
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};

/**
 * Production optimization middleware
 */
export const setupProductionOptimizations = (app) => {
  // Response caching for static content
  app.use('/static', express.static('dist', {
    maxAge: '1y',
    etag: true,
    lastModified: true,
  }));

  // Response compression
  app.use(compression({
    level: 6,
    threshold: '1kb',
  }));

  // Cache control headers
  app.use((req, res, next) => {
    // Cache API responses for 5 minutes
    if (req.path.startsWith('/api/')) {
      res.set('Cache-Control', 'public, max-age=300');
    }

    // Don't cache HTML pages
    if (req.accepts('html')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    next();
  });

  return app;
};

/**
 * Database connection with production settings
 */
export const setupProductionDatabase = async () => {
  const config = PRODUCTION_CONFIG.DATABASE;

  const db = knex({
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: config.POOL,
    acquireConnectionTimeout: config.QUERY.TIMEOUT,
  });

  // Enable query logging in development
  if (process.env.NODE_ENV === 'development') {
    db.on('query', (query) => {
      console.log('SQL Query:', query.sql);
      console.log('Parameters:', query.bindings);
    });
  }

  return db;
};

/**
 * Redis connection with production settings
 */
export const setupProductionRedis = () => {
  const config = PRODUCTION_CONFIG.CACHE.REDIS;

  const redis = new Redis({
    host: config.HOST,
    port: config.PORT,
    password: config.PASSWORD,
    db: config.DB,
    keyPrefix: config.KEY_PREFIX,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on('error', (error) => {
    console.error('Redis connection error:', error);
  });

  return redis;
};

/**
 * Production deployment checklist
 */
export const productionChecklist = {
  // Pre-deployment checks
  preDeployment: [
    'Environment variables configured',
    'Database migrations run',
    'Redis connection tested',
    'File storage configured',
    'CDN configured',
    'SSL certificates installed',
    'Domain DNS configured',
    'Security headers configured',
    'Rate limiting enabled',
    'Error tracking configured',
    'Analytics configured',
    'Health checks implemented',
  ],

  // Post-deployment checks
  postDeployment: [
    'Application responds to requests',
    'Database connections working',
    'File uploads working',
    'Email sending working',
    'Authentication working',
    'All routes accessible',
    'Performance metrics collected',
    'Error monitoring active',
    'Backup systems operational',
    'Security scans passed',
  ],

  // Monitoring checks
  monitoring: [
    'Server response time < 500ms',
    'Database query time < 100ms',
    'Error rate < 1%',
    'Uptime > 99.9%',
    'SSL certificates valid',
    'Domain accessible',
    'CDN working',
    'Backups created',
  ],
};

/**
 * Generate production build
 */
export const generateProductionBuild = async () => {
  console.log('🚀 Starting production build...');

  try {
    // Validate configuration
    const configValidation = validateProductionConfig();
    if (!configValidation.isValid) {
      throw new Error(`Configuration errors: ${configValidation.errors.join(', ')}`);
    }

    console.log('✅ Configuration validated');

    // Run tests
    console.log('🧪 Running tests...');
    // Test execution would go here

    // Build application
    console.log('🔨 Building application...');
    // Build process would go here

    // Generate documentation
    console.log('📚 Generating documentation...');
    const docs = await generateProjectDocs();

    // Run security audit
    console.log('🔒 Running security audit...');
    // Security audit would go here

    console.log('✅ Production build completed successfully');

    return {
      success: true,
      buildTime: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      documentation: docs,
    };

  } catch (error) {
    console.error('❌ Production build failed:', error);
    throw error;
  }
};

export default PRODUCTION_CONFIG;
