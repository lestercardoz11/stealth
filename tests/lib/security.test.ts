import { 
  validateInput, 
  validateEmail, 
  validatePassword,
  rateLimiter,
  RATE_LIMITS 
} from '@/lib/security/input-validation';
import { auditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';

describe('Input Validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email addresses', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject empty emails', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require minimum length', () => {
      const result = validatePassword('short');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });
  });

  describe('validateInput', () => {
    it('should validate required fields', () => {
      const result = validateInput('', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should validate minimum length', () => {
      const result = validateInput('ab', { minLength: 5 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum length is 5 characters');
    });

    it('should validate maximum length', () => {
      const result = validateInput('toolong', { maxLength: 3 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum length is 3 characters');
    });
  });
});

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear rate limiter state
    rateLimiter['limits'].clear();
  });

  it('should allow requests within limit', () => {
    const key = 'test-key';
    const { maxRequests, windowMs } = RATE_LIMITS.LOGIN;
    
    for (let i = 0; i < maxRequests; i++) {
      expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(true);
    }
  });

  it('should block requests exceeding limit', () => {
    const key = 'test-key';
    const { maxRequests, windowMs } = RATE_LIMITS.LOGIN;
    
    // Use up all allowed requests
    for (let i = 0; i < maxRequests; i++) {
      rateLimiter.isAllowed(key, maxRequests, windowMs);
    }
    
    // Next request should be blocked
    expect(rateLimiter.isAllowed(key, maxRequests, windowMs)).toBe(false);
  });

  it('should reset after time window', () => {
    const key = 'test-key';
    const shortWindow = 100; // 100ms
    
    // Use up requests
    for (let i = 0; i < 5; i++) {
      rateLimiter.isAllowed(key, 5, shortWindow);
    }
    
    // Should be blocked
    expect(rateLimiter.isAllowed(key, 5, shortWindow)).toBe(false);
    
    // Wait for window to reset
    setTimeout(() => {
      expect(rateLimiter.isAllowed(key, 5, shortWindow)).toBe(true);
    }, shortWindow + 10);
  });
});

describe('Audit Logger', () => {
  beforeEach(() => {
    // Clear audit logs
    auditLogger['logs'] = [];
  });

  it('should log audit events', async () => {
    await auditLogger.log({
      userId: 'user-1',
      userEmail: 'test@test.com',
      action: AUDIT_ACTIONS.LOGIN_SUCCESS,
      resource: 'Authentication',
      details: 'User logged in successfully',
      severity: 'low'
    });

    const logs = auditLogger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe(AUDIT_ACTIONS.LOGIN_SUCCESS);
    expect(logs[0].userId).toBe('user-1');
  });

  it('should filter logs by criteria', async () => {
    await auditLogger.log({
      userId: 'user-1',
      action: AUDIT_ACTIONS.LOGIN_SUCCESS,
      resource: 'Authentication',
      details: 'Success',
      severity: 'low'
    });

    await auditLogger.log({
      userId: 'user-2',
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      resource: 'Authentication',
      details: 'Failed',
      severity: 'high'
    });

    const highSeverityLogs = auditLogger.getLogs({ severity: 'high' });
    expect(highSeverityLogs).toHaveLength(1);
    expect(highSeverityLogs[0].severity).toBe('high');

    const user1Logs = auditLogger.getLogs({ userId: 'user-1' });
    expect(user1Logs).toHaveLength(1);
    expect(user1Logs[0].userId).toBe('user-1');
  });

  it('should generate security metrics', async () => {
    await auditLogger.log({
      action: AUDIT_ACTIONS.LOGIN_SUCCESS,
      resource: 'Authentication',
      details: 'Success',
      severity: 'low'
    });

    await auditLogger.log({
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      resource: 'Authentication',
      details: 'Failed',
      severity: 'high'
    });

    const metrics = auditLogger.getSecurityMetrics();
    expect(metrics.totalEvents).toBe(2);
    expect(metrics.authenticationEvents).toBe(2);
    expect(metrics.failedLogins).toBe(1);
  });
});