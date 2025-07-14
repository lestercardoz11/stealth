"use client";

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/lib/types/database';
import { formatDistanceToNow } from 'date-fns';
import { 
  UserPlus, 
  FileText, 
  MessageSquare, 
  Settings, 
  Shield,
  Upload,
  Download,
  Eye
} from 'lucide-react';

interface RecentActivityProps {
  users: Profile[];
}

// Mock activity data for demonstration
const generateMockActivity = (users: Profile[]) => {
  const activities = [
    {
      id: '1',
      type: 'user_signup',
      user: users[0] || { email: 'john.doe@lawfirm.com', full_name: 'John Doe' },
      action: 'signed up for an account',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      icon: UserPlus,
      color: 'text-blue-500'
    },
    {
      id: '2',
      type: 'document_upload',
      user: users[1] || { email: 'jane.smith@lawfirm.com', full_name: 'Jane Smith' },
      action: 'uploaded "Contract_Analysis_Q3.pdf"',
      timestamp: new Date(Date.now() - 1000 * 60 * 32), // 32 minutes ago
      icon: Upload,
      color: 'text-green-500'
    },
    {
      id: '3',
      type: 'chat_session',
      user: users[2] || { email: 'mike.johnson@lawfirm.com', full_name: 'Mike Johnson' },
      action: 'started a new AI chat session',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      icon: MessageSquare,
      color: 'text-purple-500'
    },
    {
      id: '4',
      type: 'document_view',
      user: users[0] || { email: 'john.doe@lawfirm.com', full_name: 'John Doe' },
      action: 'viewed "Legal_Research_Template.docx"',
      timestamp: new Date(Date.now() - 1000 * 60 * 67), // 1 hour ago
      icon: Eye,
      color: 'text-gray-500'
    },
    {
      id: '5',
      type: 'settings_change',
      user: users[1] || { email: 'jane.smith@lawfirm.com', full_name: 'Jane Smith' },
      action: 'updated notification preferences',
      timestamp: new Date(Date.now() - 1000 * 60 * 89), // 1.5 hours ago
      icon: Settings,
      color: 'text-orange-500'
    },
    {
      id: '6',
      type: 'admin_action',
      user: users[2] || { email: 'admin@lawfirm.com', full_name: 'Admin User' },
      action: 'approved 3 pending user accounts',
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      icon: Shield,
      color: 'text-red-500'
    }
  ];

  return activities;
};

export function RecentActivity({ users }: RecentActivityProps) {
  const activities = generateMockActivity(users);

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

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <Badge variant="secondary">New User</Badge>;
      case 'document_upload':
        return <Badge variant="default" className="bg-green-500">Upload</Badge>;
      case 'chat_session':
        return <Badge variant="default" className="bg-purple-500">Chat</Badge>;
      case 'document_view':
        return <Badge variant="outline">View</Badge>;
      case 'settings_change':
        return <Badge variant="default" className="bg-orange-500">Settings</Badge>;
      case 'admin_action':
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Recent Activity</h3>
        <Badge variant="outline" className="text-xs">
          Live Updates
        </Badge>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials(activity.user.full_name, activity.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {activity.user.full_name || activity.user.email}
                  </span>
                </div>
                {getActivityBadge(activity.type)}
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">
                {activity.action}
              </p>
              
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          View all activity →
        </button>
      </div>
    </div>
  );
}