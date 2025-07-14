'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Profile } from '@/lib/types/database';
import { updateUserStatus } from '@/lib/auth/actions';
import { UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserApprovalCardProps {
  pendingUsers: Profile[];
}

export function UserApprovalCard({ pendingUsers }: UserApprovalCardProps) {
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(
    new Set()
  );

  const handleUserAction = async (
    userId: string,
    action: 'approved' | 'rejected'
  ) => {
    setProcessingUsers((prev) => new Set(prev).add(userId));

    try {
      await updateUserStatus(userId, action);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    } finally {
      setProcessingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  if (pendingUsers.length === 0) {
    return null;
  }

  return (
    <Card className='border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-yellow-800 dark:text-yellow-200'>
          <AlertTriangle className='h-5 w-5' />
          Pending User Approvals
          <Badge variant='secondary' className='ml-2'>
            {pendingUsers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-yellow-700 dark:text-yellow-300 mb-6'>
          {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''}{' '}
          waiting for approval to access the platform.
        </p>

        <div className='space-y-4'>
          {pendingUsers.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className='flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border'>
              <div className='flex items-center space-x-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback className='bg-primary text-primary-foreground'>
                    {getInitials(user.full_name, user.email)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className='font-medium'>
                    {user.full_name || user.email}
                  </div>
                  {user.full_name && (
                    <div className='text-sm text-muted-foreground'>
                      {user.email}
                    </div>
                  )}
                  <div className='flex items-center text-xs text-muted-foreground mt-1'>
                    <Clock className='h-3 w-3 mr-1' />
                    Registered{' '}
                    {formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <Badge variant='secondary' className='text-xs'>
                  {user.role}
                </Badge>

                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleUserAction(user.id, 'approved')}
                  disabled={processingUsers.has(user.id)}
                  className='text-green-600 hover:text-green-700 hover:bg-green-50'>
                  <UserCheck className='h-4 w-4 mr-1' />
                  Approve
                </Button>

                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleUserAction(user.id, 'rejected')}
                  disabled={processingUsers.has(user.id)}
                  className='text-red-600 hover:text-red-700 hover:bg-red-50'>
                  <UserX className='h-4 w-4 mr-1' />
                  Reject
                </Button>
              </div>
            </div>
          ))}

          {pendingUsers.length > 5 && (
            <div className='text-center py-2'>
              <p className='text-sm text-muted-foreground'>
                And {pendingUsers.length - 5} more users waiting for approval...
              </p>
              <Button variant='outline' size='sm' className='mt-2'>
                View All Pending Users
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
