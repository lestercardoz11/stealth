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
        'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        urgent &&
          'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 dark:border-yellow-700 dark:bg-gradient-to-br dark:from-yellow-900/20 dark:to-orange-900/20'
      )}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
        <CardTitle className='text-xs font-semibold text-gray-700 dark:text-gray-200'>{title}</CardTitle>
        <Icon
          className={cn(
            'h-4 w-4',
            urgent ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-500 dark:text-blue-400'
          )}
        />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold text-gray-900 dark:text-white mb-1'>{value}</div>
        <div className='flex items-center space-x-2 mb-2'>
          <span className={cn('flex items-center text-xs', getTrendColor())}>
            {getTrendIcon()}
            <span className='ml-0.5 font-medium'>{change}</span>
          </span>
        </div>
        <p className='text-xs text-gray-600 dark:text-gray-400'>{description}</p>
      </CardContent>
    </Card>
  );
}
