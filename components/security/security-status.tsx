'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Lock,
  Eye,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface SecurityMetric {
  name: string;
  status: 'secure' | 'warning' | 'critical';
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SecurityStatusProps {
  variant?: 'compact' | 'detailed';
  className?: string;
}

export function SecurityStatus({
  variant = 'detailed',
  className,
}: SecurityStatusProps) {
  const [securityScore, setSecurityScore] = useState(0);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);

  useEffect(() => {
    // Simulate security metrics calculation
    const mockMetrics: SecurityMetric[] = [
      {
        name: 'Data Encryption',
        status: 'secure',
        value: 100,
        description: 'All data encrypted at rest and in transit',
        icon: Lock,
      },
      {
        name: 'Access Control',
        status: 'secure',
        value: 95,
        description: 'Role-based access control active',
        icon: Shield,
      },
      {
        name: 'Privacy Protection',
        status: 'secure',
        value: 100,
        description: 'No external data sharing',
        icon: Eye,
      },
      {
        name: 'System Integrity',
        status: 'secure',
        value: 98,
        description: 'All security checks passed',
        icon: Server,
      },
      {
        name: 'Session Security',
        status: 'warning',
        value: 85,
        description: 'Some sessions approaching timeout',
        icon: Clock,
      },
    ];

    setMetrics(mockMetrics);

    // Calculate overall security score
    const avgScore =
      mockMetrics.reduce((sum, metric) => sum + metric.value, 0) /
      mockMetrics.length;
    setSecurityScore(Math.round(avgScore));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-yellow-500' />;
      case 'critical':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      default:
        return <Activity className='h-4 w-4 text-gray-500' />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10',
          className
        )}>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-green-600' />
              <span className='font-semibold'>Security Score</span>
            </div>
            <div className='flex items-center gap-2'>
              <span
                className={cn(
                  'text-2xl font-bold',
                  getScoreColor(securityScore)
                )}>
                {securityScore}
              </span>
              <span className='text-sm text-muted-foreground'>/100</span>
            </div>
          </div>
          <Progress value={securityScore} className='mt-2' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10',
        className
      )}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-green-900 dark:text-green-100'>
          <Shield className='h-5 w-5 text-green-600' />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Overall Score */}
        <div className='text-center p-4 bg-white dark:bg-gray-800 rounded-lg border'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <span className='text-sm font-medium'>Overall Security Score</span>
          </div>
          <div
            className={cn('text-3xl font-bold', getScoreColor(securityScore))}>
            {securityScore}/100
          </div>
          <Progress value={securityScore} className='mt-2' />
          <p className='text-xs text-muted-foreground mt-2'>
            Excellent security posture
          </p>
        </div>

        {/* Security Metrics */}
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-green-800 dark:text-green-200'>
            Security Metrics
          </h4>
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className='flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border'>
              <div className='flex items-center gap-3'>
                <metric.icon
                  className={cn('h-4 w-4', getStatusColor(metric.status))}
                />
                <div>
                  <p className='font-medium text-sm'>{metric.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {metric.description}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>{metric.value}%</span>
                {getStatusIcon(metric.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Security Features */}
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-green-800 dark:text-green-200'>
            Active Security Features
          </h4>
          <div className='grid grid-cols-2 gap-2'>
            <Badge
              variant='outline'
              className='justify-center bg-green-50 border-green-200 text-green-800'>
              <Lock className='h-3 w-3 mr-1' />
              Encrypted
            </Badge>
            <Badge
              variant='outline'
              className='justify-center bg-green-50 border-green-200 text-green-800'>
              <Shield className='h-3 w-3 mr-1' />
              RLS Enabled
            </Badge>
            <Badge
              variant='outline'
              className='justify-center bg-green-50 border-green-200 text-green-800'>
              <Eye className='h-3 w-3 mr-1' />
              Audit Logs
            </Badge>
            <Badge
              variant='outline'
              className='justify-center bg-green-50 border-green-200 text-green-800'>
              <Server className='h-3 w-3 mr-1' />
              Local Only
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
