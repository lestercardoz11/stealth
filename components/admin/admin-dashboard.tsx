'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from './metric-card';
import { UsageChart } from './usage-chart';
import { UserApprovalCard } from './user-approval-card';
import { Profile } from '@/lib/types/database';
import { ErrorBoundary } from '@/components/ui/error-boundary';

import {
  Users,
  Clock,
  FileText,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

type Props = {
  allUsers: Profile[];
  pendingUsers: Profile[];
};

export default function AdminDashboard({ allUsers, pendingUsers }: Props) {
  const approvedUsers = allUsers.filter((user) => user.status === 'approved');
  // const adminUsers = allUsers.filter(user => user.role === 'admin');

  // Mock data for demonstration
  const mockMetrics = {
    totalDocuments: 1247,
    chatSessions: 892,
    activeUsers: approvedUsers.length,
    systemUptime: '99.9%',
  };

  return (
    <ErrorBoundary>
      <div className='space-y-4 p-6 overflow-x-hidden'>
        {/* Key Metrics */}
        <div className='grid gap-2 md:gap-3 grid-cols-2 lg:grid-cols-4'>
          <MetricCard
            title='Total Users'
            value={allUsers.length}
            change='+12%'
            trend='up'
            icon={Users}
            description='All registered users'
          />
          <MetricCard
            title='Pending Approvals'
            value={pendingUsers.length}
            change={pendingUsers.length > 0 ? 'Needs attention' : 'All clear'}
            trend={pendingUsers.length > 0 ? 'neutral' : 'up'}
            icon={Clock}
            description='Awaiting approval'
            urgent={pendingUsers.length > 0}
          />
          <MetricCard
            title='Documents'
            value={mockMetrics.totalDocuments}
            change='+8%'
            trend='up'
            icon={FileText}
            description='Total documents stored'
          />
          <MetricCard
            title='Chat Sessions'
            value={mockMetrics.chatSessions}
            change='+23%'
            trend='up'
            icon={MessageSquare}
            description='This month'
          />
        </div>

        {/* Pending Users Alert */}
        {pendingUsers.length > 0 && (
          <div className='animate-pulse'>
            <UserApprovalCard pendingUsers={pendingUsers} />
          </div>
        )}

        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsageChart />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
