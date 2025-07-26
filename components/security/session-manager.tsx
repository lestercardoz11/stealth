'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield,
  AlertTriangle,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActiveSession {
  id: string;
  userId: string;
  userEmail: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  ipAddress: string;
  location: string;
  lastActivity: Date;
  isCurrentSession: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface SessionManagerProps {
  className?: string;
}

export function SessionManager({ className }: SessionManagerProps) {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock session data
    const mockSessions: ActiveSession[] = [
      {
        id: '1',
        userId: 'user-1',
        userEmail: 'admin@lawfirm.com',
        deviceType: 'desktop',
        browser: 'Chrome 120.0',
        ipAddress: '192.168.1.100',
        location: 'New York, NY',
        lastActivity: new Date(Date.now() - 1000 * 60 * 5),
        isCurrentSession: true,
        riskLevel: 'low'
      },
      {
        id: '2',
        userId: 'user-2',
        userEmail: 'jane.smith@lawfirm.com',
        deviceType: 'mobile',
        browser: 'Safari 17.0',
        ipAddress: '192.168.1.101',
        location: 'New York, NY',
        lastActivity: new Date(Date.now() - 1000 * 60 * 15),
        isCurrentSession: false,
        riskLevel: 'low'
      },
      {
        id: '3',
        userId: 'user-3',
        userEmail: 'mike.johnson@lawfirm.com',
        deviceType: 'desktop',
        browser: 'Firefox 121.0',
        ipAddress: '203.0.113.45',
        location: 'Unknown Location',
        lastActivity: new Date(Date.now() - 1000 * 60 * 120),
        isCurrentSession: false,
        riskLevel: 'high'
      },
      {
        id: '4',
        userId: 'user-4',
        userEmail: 'sarah.wilson@lawfirm.com',
        deviceType: 'tablet',
        browser: 'Chrome 120.0',
        ipAddress: '192.168.1.103',
        location: 'New York, NY',
        lastActivity: new Date(Date.now() - 1000 * 60 * 30),
        isCurrentSession: false,
        riskLevel: 'low'
      }
    ];

    setSessions(mockSessions);
  }, []);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Risk</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-500 text-xs">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low Risk</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const terminateSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Failed to terminate session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const terminateAllSessions = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSessions(prev => prev.filter(session => session.isCurrentSession));
    } catch (error) {
      console.error('Failed to terminate sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  const activeSessions = sessions.length;
  const riskySessions = sessions.filter(s => s.riskLevel === 'high').length;
  const recentSessions = sessions.filter(s => 
    new Date(s.lastActivity).getTime() > Date.now() - 60 * 60 * 1000
  ).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={terminateAllSessions}
            disabled={isLoading}
          >
            Terminate All Others
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold">{activeSessions}</div>
            <div className="text-xs text-muted-foreground">Active Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{riskySessions}</div>
            <div className="text-xs text-muted-foreground">High Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{recentSessions}</div>
            <div className="text-xs text-muted-foreground">Last Hour</div>
          </div>
        </div>

        {/* Session List */}
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active sessions</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(session.userEmail)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{session.userEmail}</span>
                        {session.isCurrentSession && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                        {getRiskBadge(session.riskLevel)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getDeviceIcon(session.deviceType)}
                          <span>{session.browser}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(session.lastActivity, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        IP: {session.ipAddress}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.riskLevel === 'high' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    {!session.isCurrentSession && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Security Notice */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Security Tip</p>
              <p className="text-blue-700 dark:text-blue-200">
                Regularly review and terminate unused sessions. Report any suspicious activity immediately.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}