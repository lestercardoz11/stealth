'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function RetryButton({
  onRetry,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className,
  children = 'Try Again',
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (disabled || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRetry}
      disabled={disabled || isRetrying}
      className={cn('gap-2', className)}>
      <RefreshCw className={cn('h-4 w-4', isRetrying && 'animate-spin')} />
      {isRetrying ? 'Retrying...' : children}
    </Button>
  );
}
