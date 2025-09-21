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

interface AdminDashboardProps {
  allUsers: Profile[];
  pendingUsers: Profile[];
  totalDocuments: number;
  totalConversations: number;
  recentActivity: Array<{
    id: string;
    type: string;
    user: { email: string; full_name?: string };
    action: string;
    timestamp: Date;
  }>;
}

export default function AdminDashboard({
  allUsers,
  pendingUsers,
  totalDocuments,
  totalConversations,
}: AdminDashboardProps) {
  // Calculate growth percentages (mock calculation for demo)
  const userGrowth = allUsers.length > 0 ? '+12%' : '0%';
  const documentGrowth = totalDocuments > 0 ? '+8%' : '0%';
  const chatGrowth = totalConversations > 0 ? '+23%' : '0%';

  return (
    <ErrorBoundary>
      <div className='space-y-4 p-6 overflow-x-hidden'>
        {/* Key Metrics */}
        <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
          <MetricCard
            title='Total Users'
            value={allUsers.length}
            change={userGrowth}
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
            value={totalDocuments}
            change={documentGrowth}
            trend='up'
            icon={FileText}
            description='Total documents stored'
          />
          <MetricCard
            title='Conversations'
            value={totalConversations}
            change={chatGrowth}
            trend='up'
            icon={MessageSquare}
            description='AI chat sessions'
          />
        </div>

        {/* Pending Users Alert */}
        {pendingUsers.length > 0 && (
          <div className='animate-pulse'>
            <UserApprovalCard pendingUsers={pendingUsers} />
          </div>
        )}

        {/* Charts and Activity */}
        <div className='grid gap-6'>
          <Card className='shadow-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <TrendingUp className='h-4 w-4' />
                Usage Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UsageChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
