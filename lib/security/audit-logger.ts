// Audit logging utilities for security events

export interface AuditEvent {
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

export interface AuditLogEntry extends AuditEvent {
  id: string;
  timestamp: Date;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory

  async log(event: AuditEvent): Promise<void> {
    const logEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...event
    };

    // Add to in-memory store
    this.logs.unshift(logEntry);
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // In a real implementation, you would also:
    // 1. Store in database
    // 2. Send to external logging service
    // 3. Trigger alerts for critical events
    
    console.log('Audit Log:', logEntry);

    // Trigger alerts for critical events
    if (event.severity === 'critical') {
      await this.triggerAlert(logEntry);
    }
  }

  private async triggerAlert(logEntry: AuditLogEntry): Promise<void> {
    // In a real implementation, this would send alerts via:
    // - Email notifications
    // - Slack/Teams webhooks
    // - SMS alerts
    // - Push notifications
    
    console.warn('CRITICAL SECURITY EVENT:', logEntry);
  }

  getLogs(filters?: {
    userId?: string;
    severity?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
      }
      
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(filters.action!.toLowerCase())
        );
      }
      
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp >= filters.startDate!
        );
      }
      
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp <= filters.endDate!
        );
      }
      
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(0, filters.limit);
      }
    }

    return filteredLogs;
  }

  getSecurityMetrics() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = this.logs.filter(log => log.timestamp >= last24Hours);

    return {
      totalEvents: this.logs.length,
      recentEvents: recentLogs.length,
      criticalEvents: recentLogs.filter(log => log.severity === 'critical').length,
      highSeverityEvents: recentLogs.filter(log => log.severity === 'high').length,
      authenticationEvents: recentLogs.filter(log => 
        log.action.includes('LOGIN') || log.action.includes('AUTH')
      ).length,
      failedLogins: recentLogs.filter(log => 
        log.action === 'LOGIN_FAILED'
      ).length,
      documentEvents: recentLogs.filter(log => 
        log.action.includes('DOCUMENT')
      ).length,
      userManagementEvents: recentLogs.filter(log => 
        log.action.includes('USER_')
      ).length
    };
  }
}

export const auditLogger = new AuditLogger();

// Predefined audit actions
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  
  // User Management
  USER_CREATED: 'USER_CREATED',
  USER_APPROVED: 'USER_APPROVED',
  USER_REJECTED: 'USER_REJECTED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
  USER_DELETED: 'USER_DELETED',
  
  // Document Management
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_VIEWED: 'DOCUMENT_VIEWED',
  DOCUMENT_DOWNLOADED: 'DOCUMENT_DOWNLOADED',
  DOCUMENT_DELETED: 'DOCUMENT_DELETED',
  DOCUMENT_SHARED: 'DOCUMENT_SHARED',
  
  // Chat/AI
  CHAT_SESSION_STARTED: 'CHAT_SESSION_STARTED',
  CHAT_MESSAGE_SENT: 'CHAT_MESSAGE_SENT',
  AI_QUERY_PROCESSED: 'AI_QUERY_PROCESSED',
  
  // System
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  SECURITY_SETTINGS_CHANGED: 'SECURITY_SETTINGS_CHANGED',
  BACKUP_CREATED: 'BACKUP_CREATED',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
  
  // Security Events
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS_ATTEMPT: 'UNAUTHORIZED_ACCESS_ATTEMPT',
  DATA_EXPORT_REQUESTED: 'DATA_EXPORT_REQUESTED',
  ACCOUNT_DELETION_REQUESTED: 'ACCOUNT_DELETION_REQUESTED'
} as const;

// Helper functions for common audit events
export async function logAuthEvent(
  action: string,
  userId?: string,
  userEmail?: string,
  success: boolean = true,
  details?: string,
  ipAddress?: string,
  userAgent?: string
) {
  await auditLogger.log({
    userId,
    userEmail,
    action,
    resource: 'Authentication',
    details: details || `${action.replace('_', ' ').toLowerCase()}`,
    ipAddress,
    userAgent,
    severity: success ? 'low' : 'high'
  });
}

export async function logUserManagementEvent(
  action: string,
  targetUserId: string,
  targetUserEmail: string,
  adminUserId?: string,
  adminUserEmail?: string,
  details?: string
) {
  await auditLogger.log({
    userId: adminUserId,
    userEmail: adminUserEmail,
    action,
    resource: 'User Management',
    details: details || `${action.replace('_', ' ').toLowerCase()} for ${targetUserEmail}`,
    severity: 'medium',
    metadata: {
      targetUserId,
      targetUserEmail
    }
  });
}

export async function logDocumentEvent(
  action: string,
  documentId: string,
  documentTitle: string,
  userId?: string,
  userEmail?: string,
  details?: string
) {
  await auditLogger.log({
    userId,
    userEmail,
    action,
    resource: 'Document Management',
    details: details || `${action.replace('_', ' ').toLowerCase()}: ${documentTitle}`,
    severity: action.includes('DELETE') ? 'medium' : 'low',
    metadata: {
      documentId,
      documentTitle
    }
  });
}

export async function logSecurityEvent(
  action: string,
  details: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'high',
  userId?: string,
  userEmail?: string,
  ipAddress?: string
) {
  await auditLogger.log({
    userId,
    userEmail,
    action,
    resource: 'Security',
    details,
    ipAddress,
    severity
  });
}