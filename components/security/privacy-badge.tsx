'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Server, Eye, CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrivacyBadgeProps {
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  showIcon?: boolean;
}

export function PrivacyBadge({ 
  variant = 'default', 
  className,
  showIcon = true 
}: PrivacyBadgeProps) {
  if (variant === 'compact') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
          className
        )}
      >
        {showIcon && <Shield className="h-3 w-3 mr-1" />}
        100% Private
      </Badge>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn("border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                100% Private Processing
              </h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                <span>No external API calls</span>
              </div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-200">
                <Lock className="h-4 w-4" />
                <span>Local AI processing only</span>
              </div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-200">
                <Server className="h-4 w-4" />
                <span>Your infrastructure</span>
              </div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-200">
                <Eye className="h-4 w-4" />
                <span>Zero data sharing</span>
              </div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-200">
                <Zap className="h-4 w-4" />
                <span>Local AI models only</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 px-3 py-1",
        className
      )}
    >
      {showIcon && <Shield className="h-4 w-4 mr-2" />}
      100% Private Processing
    </Badge>
  );
}