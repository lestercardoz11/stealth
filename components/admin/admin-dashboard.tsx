'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Shield,
  Zap,
} from 'lucide-react';

type Props = {
  allUsers: Profile[];
  pendingUsers: Profile[];
  currentAdmin: Profile | null;
};

export default function AdminDashboard({
  allUsers,
  pendingUsers,
  currentAdmin,
}: Props) {
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
    <div className='space-y-6'>
      {/* Welcome Section */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Welcome back,{' '}
            {currentAdmin?.full_name || currentAdmin?.email || 'Admin'}
          </h1>
          <p className='text-muted-foreground'>
            {`Here's what's happening with your Stealth platform today`}
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant='default' className='bg-green-500'>
            <Shield className='w-3 h-3 mr-1' />
            System Secure
          </Badge>
          <Badge variant='outline'>
            <Activity className='w-3 h-3 mr-1' />
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
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
        <UserApprovalCard pendingUsers={pendingUsers} />
      )}

      <Card>
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

      {/* Charts and Analytics */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity users={allUsers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
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
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <Button variant='outline' className='h-20 flex-col'>
              <Users className='h-6 w-6 mb-2' />
              Manage Users
            </Button>
            <Button variant='outline' className='h-20 flex-col'>
              <FileText className='h-6 w-6 mb-2' />
              Upload Documents
            </Button>
            <Button variant='outline' className='h-20 flex-col'>
              <Zap className='h-6 w-6 mb-2' />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
