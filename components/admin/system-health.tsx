"use client";

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Database, 
  Shield, 
  Zap, 
  HardDrive, 
  Cpu,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// Mock system health data
const systemMetrics = [
  {
    name: 'Server Status',
    status: 'operational',
    value: 100,
    icon: Server,
    description: 'All systems operational'
  },
  {
    name: 'Database',
    status: 'operational',
    value: 98,
    icon: Database,
    description: 'Response time: 45ms'
  },
  {
    name: 'Security',
    status: 'operational',
    value: 100,
    icon: Shield,
    description: 'All security checks passed'
  },
  {
    name: 'AI Processing',
    status: 'operational',
    value: 95,
    icon: Zap,
    description: 'Processing normally'
  },
  {
    name: 'Storage',
    status: 'warning',
    value: 78,
    icon: HardDrive,
    description: '78% capacity used'
  },
  {
    name: 'CPU Usage',
    status: 'operational',
    value: 34,
    icon: Cpu,
    description: 'Average load: 34%'
  }
];

export function SystemHealth() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge variant="default" className="bg-green-500 text-xs">Operational</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500 text-xs">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const overallHealth = systemMetrics.every(metric => metric.status === 'operational') ? 'healthy' : 'warning';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">System Health Overview</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon(overallHealth)}
          <span className="text-sm font-medium">
            {overallHealth === 'healthy' ? 'All Systems Operational' : 'Some Issues Detected'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {systemMetrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                <span className="text-sm font-medium">{metric.name}</span>
              </div>
              {getStatusBadge(metric.status)}
            </div>
            
            <Progress 
              value={metric.value} 
              className="h-2"
            />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{metric.description}</span>
              <span>{metric.value}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">99.9%</div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold">45ms</div>
            <div className="text-xs text-muted-foreground">Avg Response</div>
          </div>
        </div>
      </div>
    </div>
  );
}