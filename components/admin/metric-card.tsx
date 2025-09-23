import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DivideIcon as LucideIcon,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: typeof LucideIcon;
  description: string;
  urgent?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
  urgent = false,
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='h-3 w-3' />;
      case 'down':
        return <TrendingDown className='h-3 w-3' />;
      default:
        return <Minus className='h-3 w-3' />;
    }
  };

  const getTrendColor = () => {
    if (urgent) return 'text-yellow-600 dark:text-yellow-400';
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        urgent &&
          'border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:border-yellow-800 dark:bg-gradient-to-br dark:from-yellow-900/10 dark:to-orange-900/10'
      )}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-xs font-semibold text-foreground/80'>
          {title}
        </CardTitle>
        <Icon
          className={cn(
            'h-3.5 w-3.5',
            urgent ? 'text-yellow-600 dark:text-yellow-400' : 'text-primary'
          )}
        />
      </CardHeader>
      <CardContent>
        <div className='text-xl font-bold text-foreground mb-1'>{value}</div>
        <div className='flex items-center space-x-2 mb-1'>
          <span className={cn('flex items-center text-xs', getTrendColor())}>
            {getTrendIcon()}
            <span className='ml-0.5 font-medium'>{change}</span>
          </span>
        </div>
        <p className='text-xs text-muted-foreground'>{description}</p>
      </CardContent>
    </Card>
  );
}
