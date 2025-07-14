import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DivideIcon as LucideIcon,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        urgent &&
          'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10'
      )}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon
          className={cn(
            'h-4 w-4',
            urgent ? 'text-yellow-600' : 'text-muted-foreground'
          )}
        />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <div className='flex items-center space-x-1 mt-1'>
          <span className={cn('flex items-center text-xs', getTrendColor())}>
            {getTrendIcon()}
            <span className='ml-1'>{change}</span>
          </span>
        </div>
        <p className='text-xs text-muted-foreground mt-1'>{description}</p>
      </CardContent>
    </Card>
  );
}
