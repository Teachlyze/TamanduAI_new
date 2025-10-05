/**
 * Security Configuration for TamanduAI Platform
 * Centralized security settings and utilities
 */

// ============================================
// SECURITY CONSTANTS
// ============================================

export const SECURITY_CONFIG = {
  // Authentication
  AUTH: {
    TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
    REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBERS: true,
    PASSWORD_REQUIRE_SPECIAL_CHARS: true,
  },

  // API Security
  API: {
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 100,
      REQUESTS_PER_HOUR: 1000,
      BURST_LIMIT: 20,
    },
    CORS: {
      ALLOWED_ORIGINS: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://tamanduai.com',
        'https://www.tamanduai.com',
      ],
      ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      ALLOWED_HEADERS: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
      ],
    },
    TIMEOUT: 30000, // 30 seconds
  },

  // File Upload Security
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    VIRUS_SCAN_ENABLED: true,
    QUARANTINE_SUSPICIOUS_FILES: true,
  },

  // Session Security
  SESSION: {
    SECURE: true,
    HTTP_ONLY: true,
    SAME_SITE: 'strict',
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Content Security Policy
  CSP: {
    DEFAULT_SRC: ["'self'"],
    SCRIPT_SRC: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    STYLE_SRC: ["'self'", "'unsafe-inline'"],
    IMG_SRC: ["'self'", 'data:', 'https:', 'blob:'],
    FONT_SRC: ["'self'", 'https:', 'data:'],
    CONNECT_SRC: ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
    MEDIA_SRC: ["'self'", 'blob:'],
    OBJECT_SRC: ["'none'"],
    FRAME_SRC: ["'none'"],
  },

  // Input Validation
  VALIDATION: {
    MAX_STRING_LENGTH: 10000,
    MAX_ARRAY_LENGTH: 1000,
    SANITIZE_HTML: true,
    ALLOWED_HTML_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    BLOCKED_PATTERNS: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload=/gi,
      /onerror=/gi,
    ],
  },
};

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Input sanitization utility
 */
export const sanitizeInput = (input, options = {}) => {
  const {
    maxLength = SECURITY_CONFIG.VALIDATION.MAX_STRING_LENGTH,
    allowHtml = false,
    allowedTags = SECURITY_CONFIG.VALIDATION.ALLOWED_HTML_TAGS,
  } = options;

  if (typeof input !== 'string') {
    return input;
  }

  // Trim and limit length
  let sanitized = input.trim().substring(0, maxLength);

  if (!allowHtml) {
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } else {
    // Allow only specific HTML tags
    const allowedTagsRegex = new RegExp(`<(?!\/?(?:${allowedTags.join('|')})\b)[^>]*>`, 'gi');
    sanitized = sanitized.replace(allowedTagsRegex, '');
  }

  // Remove blocked patterns
  SECURITY_CONFIG.VALIDATION.BLOCKED_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
};

/**
 * Password strength validator
 */
export const validatePasswordStrength = (password) => {
  const config = SECURITY_CONFIG.AUTH;
  const errors = [];

  if (password.length < config.PASSWORD_MIN_LENGTH) {
    errors.push(`Senha deve ter pelo menos ${config.PASSWORD_MIN_LENGTH} caracteres`);
  }

  if (config.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (config.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (config.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  if (config.PASSWORD_REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }

  return {
    isValid: errors.length === 0,
    score: Math.min(5, password.length / 3 + (errors.length === 0 ? 2 : 0)),
    errors,
  };
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean old entries
    for (const [requestKey, timestamp] of this.requests.entries()) {
      if (timestamp < windowStart) {
        this.requests.delete(requestKey);
      }
    }

    // Count requests in current window
    const requestCount = Array.from(this.requests.values())
      .filter(timestamp => timestamp > windowStart).length;

    if (requestCount >= this.limit) {
      return false;
    }

    // Add current request
    this.requests.set(key, now);
    return true;
  }

  getRemainingTime(key) {
    const lastRequest = this.requests.get(key);
    if (!lastRequest) return 0;

    const timePassed = Date.now() - lastRequest;
    return Math.max(0, this.windowMs - timePassed);
  }
}

/**
 * Content Security Policy middleware
 */
export const generateCSPHeader = () => {
  const csp = SECURITY_CONFIG.CSP;
  const directives = Object.entries(csp)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  return `Content-Security-Policy: ${directives}`;
};

/**
 * Security headers middleware
 */
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': generateCSPHeader(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
});

/**
 * File type validation
 */
export const validateFileType = (file, allowedTypes = SECURITY_CONFIG.UPLOAD.ALLOWED_FILE_TYPES) => {
  return allowedTypes.includes(file.type);
};

/**
 * File size validation
 */
export const validateFileSize = (file, maxSize = SECURITY_CONFIG.UPLOAD.MAX_FILE_SIZE) => {
  return file.size <= maxSize;
};

/**
 * Generate secure random string
 */
export const generateSecureToken = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash password client-side (for validation only)
 */
export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

export default SECURITY_CONFIG;
