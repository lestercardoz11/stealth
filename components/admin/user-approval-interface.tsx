"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Profile } from '@/lib/types/database';
import { updateUserStatus } from '@/lib/auth/actions';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Mail,
  Calendar,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface UserApprovalInterfaceProps {
  users: Profile[];
}

export function UserApprovalInterface({ users }: UserApprovalInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const router = useRouter();

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserAction = async (userId: string, action: 'approved' | 'rejected') => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    
    try {
      await updateUserStatus(userId, action);
      router.refresh();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleBulkApproval = async () => {
    const userIds = filteredUsers.map(user => user.id);
    
    for (const userId of userIds) {
      if (!processingUsers.has(userId)) {
        await handleUserAction(userId, 'approved');
      }
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending User Approvals
                <Badge variant="secondary">{filteredUsers.length}</Badge>
              </CardTitle>
            </div>
            
            {filteredUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkApproval}
                  disabled={processingUsers.size > 0}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Approve All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Cards */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(user.full_name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">
                        {user.full_name || user.email}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUserAction(user.id, 'approved')}
                    disabled={processingUsers.has(user.id)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    {processingUsers.has(user.id) ? 'Processing...' : 'Approve'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUserAction(user.id, 'rejected')}
                    disabled={processingUsers.has(user.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    {processingUsers.has(user.id) ? 'Processing...' : 'Reject'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Users</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'No users match your search criteria.' 
                  : 'All user registrations have been processed.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}