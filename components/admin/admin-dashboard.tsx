'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard } from './metric-card';
import { UsageChart } from './usage-chart';
import { RecentActivity } from './recent-activity';
import { UserApprovalCard } from './user-approval-card';
import { SystemHealth } from './system-health';
import { Profile } from '@/lib/types/database';

import {
  Users,
  Clock,
  FileText,
  MessageSquare,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';

type Props = {
  allUsers: Profile[];
  pendingUsers: Profile[];
};

export default function AdminDashboard({ allUsers, pendingUsers }: Props) {
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [users, pending, admin] = await Promise.all([
  //         getAllUsers(),
  //         getPendingUsers(),
  //         getCurrentUserProfile(),
  //       ]);

  //       setAllUsers(users);
  //       setPendingUsers(pending);
  //       setCurrentAdmin(admin);
  //     } catch (error) {
  //       console.error('Failed to fetch dashboard data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

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
    <div className='space-y-6 p-6'>
      {/* Key Metrics */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
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

      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <TrendingUp className='h-5 w-5' />
            Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsageChart />
        </CardContent>
      </Card>

      {/* Charts and Analytics */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Recent Activity */}
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Activity className='h-5 w-5' />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity users={allUsers} />
          </CardContent>
        </Card>

        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Activity className='h-5 w-5' />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SystemHealth />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className='shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'>
        <CardHeader>
          <CardTitle className='text-lg'>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <Button
              variant='outline'
              className='h-24 flex-col hover:bg-blue-50 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-800'>
              <Users className='h-6 w-6 mb-2' />
              <span className='font-medium'>Manage Users</span>
            </Button>
            <Button
              variant='outline'
              className='h-24 flex-col hover:bg-green-50 dark:hover:bg-green-950/50 border-green-200 dark:border-green-800'>
              <FileText className='h-6 w-6 mb-2' />
              <span className='font-medium'>Upload Documents</span>
            </Button>
            <Button
              variant='outline'
              className='h-24 flex-col hover:bg-purple-50 dark:hover:bg-purple-950/50 border-purple-200 dark:border-purple-800'>
              <Zap className='h-6 w-6 mb-2' />
              <span className='font-medium'>System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
