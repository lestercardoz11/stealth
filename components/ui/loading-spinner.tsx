import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && (
        <span
          className={cn(
            'text-muted-foreground',
            size === 'sm' && 'text-sm',
            size === 'lg' && 'text-lg'
          )}>
          {text}
        </span>
      )}
    </div>
  );
}

// Full page loading component
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto'>
          <span className='text-primary-foreground font-bold text-xl'>S</span>
        </div>
        <LoadingSpinner size='lg' text={message} />
      </div>
    </div>
  );
}

// Inline loading for buttons and small components
export function InlineLoading({
  text = 'Loading...',
  size = 'sm',
}: {
  text?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className='flex items-center gap-2'>
      <Loader2
        className={cn('animate-spin', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')}
      />
      <span
        className={cn(
          'text-muted-foreground',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
        {text}
      </span>
    </div>
  );
}
