/**
 * Secure logging utility that sanitizes sensitive data in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Sensitive patterns to redact
const SENSITIVE_PATTERNS = [
  /access[\s_-]?token/i,
  /bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,
  /ey[a-zA-Z0-9\-._~+/]+=*/gi, // JWT tokens
  /session[\s_-]?id/i,
  /password/i,
  /secret/i,
  /api[\s_-]?key/i,
];

/**
 * Sanitize an object by redacting sensitive fields
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    const value = obj[key];
    const keyLower = key.toLowerCase();

    // Check if key contains sensitive pattern
    const isSensitive = SENSITIVE_PATTERNS.some(pattern =>
      pattern.test(keyLower)
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      // Check if value looks like a token
      if (value.length > 100 && /^[a-zA-Z0-9\-._~+/]+=*$/.test(value)) {
        sanitized[key] = `[REDACTED:${value.substring(0, 10)}...]`;
      } else {
        sanitized[key] = value;
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Secure logger that only logs in development and sanitizes sensitive data in production
 */
export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  info: (...args: any[]) => {
    const sanitized = args.map(arg =>
      typeof arg === 'object' ? sanitizeObject(arg) : arg
    );
    console.info(...sanitized);
  },

  warn: (...args: any[]) => {
    const sanitized = args.map(arg =>
      typeof arg === 'object' ? sanitizeObject(arg) : arg
    );
    console.warn(...sanitized);
  },

  error: (...args: any[]) => {
    const sanitized = args.map(arg => {
      if (arg instanceof Error) {
        // In production, only log error message, not stack trace
        return isDevelopment ? arg : { message: arg.message, name: arg.name };
      }
      return typeof arg === 'object' ? sanitizeObject(arg) : arg;
    });
    console.error(...sanitized);
  },
};
