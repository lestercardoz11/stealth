'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Shield, FileCheck, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface ComplianceIndicatorProps {
  variant?: 'badge' | 'card' | 'detailed';
  className?: string;
  showDetails?: boolean;
}

export function ComplianceIndicator({
  variant = 'badge',
  className,
  showDetails = false,
}: ComplianceIndicatorProps) {
  const complianceItems = [
    {
      name: 'SOC 2 Type II',
      status: 'compliant',
      icon: Shield,
      description: 'Security, availability, and confidentiality controls',
    },
    {
      name: 'GDPR',
      status: 'compliant',
      icon: Globe,
      description: 'European data protection regulation compliance',
    },
    {
      name: 'HIPAA',
      status: 'compliant',
      icon: FileCheck,
      description: 'Healthcare information privacy and security',
    },
    {
      name: 'ISO 27001',
      status: 'compliant',
      icon: Lock,
      description: 'Information security management system',
    },
  ];

  if (variant === 'badge') {
    return (
      <Badge
        variant='outline'
        className={cn(
          'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
          className
        )}>
        <CheckCircle className='h-3 w-3 mr-1' />
        Compliance Ready
      </Badge>
    );
  }

  if (variant === 'card') {
    return (
      <Card
        className={cn(
          'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10',
          className
        )}>
        <CardContent className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <CheckCircle className='h-5 w-5 text-blue-600' />
            <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
              Compliance Ready
            </h3>
          </div>
          <p className='text-sm text-blue-700 dark:text-blue-200'>
            Meets industry standards for security and privacy
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10',
        className
      )}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-blue-900 dark:text-blue-100'>
          <CheckCircle className='h-5 w-5 text-blue-600' />
          Compliance Status
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {complianceItems.map((item) => (
          <div
            key={item.name}
            className='flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border'>
            <div className='flex items-center gap-3'>
              <item.icon className='h-4 w-4 text-blue-600' />
              <div>
                <p className='font-medium text-sm'>{item.name}</p>
                {showDetails && (
                  <p className='text-xs text-muted-foreground'>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <Badge variant='default' className='bg-green-500 text-xs'>
              <CheckCircle className='h-3 w-3 mr-1' />
              Compliant
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
