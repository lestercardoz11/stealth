// Input validation and sanitization utilities

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateInput(value: string, rules: ValidationRule): ValidationResult {
  const errors: string[] = [];

  // Required check
  if (rules.required && (!value || value.trim().length === 0)) {
    errors.push('This field is required');
  }

  // Skip other validations if value is empty and not required
  if (!value || value.trim().length === 0) {
    return { isValid: errors.length === 0, errors };
  }

  // Length validations
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push('Invalid format');
  }

  // Custom validation
  if (rules.customValidator && !rules.customValidator(value)) {
    errors.push('Invalid value');
  }

  return { isValid: errors.length === 0, errors };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length
}

export function validateEmail(email: string): ValidationResult {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateInput(email, {
    required: true,
    pattern: emailPattern,
    maxLength: 254
  });
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateFileName(fileName: string): ValidationResult {
  const errors: string[] = [];

  if (!fileName || fileName.trim().length === 0) {
    errors.push('File name is required');
    return { isValid: false, errors };
  }

  // Check for dangerous characters
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(fileName)) {
    errors.push('File name contains invalid characters');
  }

  // Check length
  if (fileName.length > 255) {
    errors.push('File name is too long (max 255 characters)');
  }

  // Check for reserved names (Windows)
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
  if (reservedNames.test(fileName)) {
    errors.push('File name is reserved');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateDocumentTitle(title: string): ValidationResult {
  return validateInput(title, {
    required: true,
    minLength: 1,
    maxLength: 200,
    customValidator: (value) => {
      // Check for potentially malicious content
      const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
      ];
      
      return !maliciousPatterns.some(pattern => pattern.test(value));
    }
  });
}

export function validateSearchQuery(query: string): ValidationResult {
  return validateInput(query, {
    required: true,
    minLength: 1,
    maxLength: 1000,
    customValidator: (value) => {
      // Prevent SQL injection attempts
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
        /\/\*.*\*\//
      ];
      
      return !sqlPatterns.some(pattern => pattern.test(value));
    }
  });
}

// Rate limiting utilities
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(key: string, maxRequests: number): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - entry.count);
  }

  getResetTime(key: string): number | null {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return null;
    }
    return entry.resetTime;
  }
}

export const rateLimiter = new RateLimiter();

// Common rate limits
export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  CHAT: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 messages per minute
  UPLOAD: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
  SEARCH: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 searches per minute
} as const;