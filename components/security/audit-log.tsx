'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  User, 
  FileText, 
  Settings, 
  AlertTriangle,
  Search,
  Download,
  Filter,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AuditLogProps {
  className?: string;
}

export function AuditLog({ className }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    // Mock audit log data
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        userId: 'user-1',
        userEmail: 'admin@lawfirm.com',
        action: 'USER_APPROVED',
        resource: 'User Management',
        details: 'Approved user john.doe@lawfirm.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        severity: 'medium'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 32),
        userId: 'user-2',
        userEmail: 'jane.smith@lawfirm.com',
        action: 'DOCUMENT_UPLOADED',
        resource: 'Document Management',
        details: 'Uploaded contract_analysis.pdf',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        severity: 'low'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        userId: 'user-3',
        userEmail: 'mike.johnson@lawfirm.com',
        action: 'LOGIN_FAILED',
        resource: 'Authentication',
        details: 'Failed login attempt - invalid password',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0...',
        severity: 'high'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 67),
        userId: 'user-1',
        userEmail: 'admin@lawfirm.com',
        action: 'SETTINGS_CHANGED',
        resource: 'System Configuration',
        details: 'Updated security settings',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        severity: 'medium'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1000 * 60 * 89),
        userId: 'user-4',
        userEmail: 'sarah.wilson@lawfirm.com',
        action: 'DOCUMENT_DELETED',
        resource: 'Document Management',
        details: 'Deleted old_contract.pdf',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0...',
        severity: 'medium'
      }
    ];

    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    // Apply action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action.includes(actionFilter.toUpperCase()));
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, severityFilter, actionFilter]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Critical</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-red-500 text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-500 text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('USER')) return <User className="h-4 w-4" />;
    if (action.includes('DOCUMENT')) return <FileText className="h-4 w-4" />;
    if (action.includes('SETTINGS')) return <Settings className="h-4 w-4" />;
    if (action.includes('LOGIN')) return <Shield className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'Severity', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.userEmail,
        log.action,
        log.resource,
        `"${log.details}"`,
        log.severity,
        log.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Log
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="user">User Actions</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="login">Authentication</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Log Entries */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No audit logs found matching your criteria</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getActionIcon(log.action)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{log.action.replace(/_/g, ' ')}</span>
                        {getSeverityBadge(log.severity)}
                      </div>
                      <p className="text-xs text-muted-foreground">{log.resource}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm mb-2">{log.details}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>User: {log.userEmail}</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold">{logs.length}</div>
            <div className="text-xs text-muted-foreground">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {logs.filter(l => l.severity === 'critical' || l.severity === 'high').length}
            </div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {logs.filter(l => l.action.includes('LOGIN')).length}
            </div>
            <div className="text-xs text-muted-foreground">Auth Events</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {logs.filter(l => new Date(l.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000).length}
            </div>
            <div className="text-xs text-muted-foreground">Last 24h</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}