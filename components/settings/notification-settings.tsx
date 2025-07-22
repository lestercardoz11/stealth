'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Bell, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationPreferences {
  emailNotifications: boolean;
  documentUploads: boolean;
  chatMessages: boolean;
  systemUpdates: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    documentUploads: true,
    chatMessages: true,
    systemUpdates: true,
    securityAlerts: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would save to your backend/database
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      
      setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to save notification preferences' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const notificationGroups = [
    {
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      items: [
        {
          key: 'emailNotifications' as keyof NotificationPreferences,
          label: 'Enable Email Notifications',
          description: 'Master toggle for all email notifications',
        },
      ],
    },
    {
      title: 'Activity Notifications',
      description: 'Get notified about platform activity',
      items: [
        {
          key: 'documentUploads' as keyof NotificationPreferences,
          label: 'Document Uploads',
          description: 'When new documents are uploaded or shared',
        },
        {
          key: 'chatMessages' as keyof NotificationPreferences,
          label: 'Chat Messages',
          description: 'New messages in AI chat conversations',
        },
        {
          key: 'systemUpdates' as keyof NotificationPreferences,
          label: 'System Updates',
          description: 'Platform updates and maintenance notifications',
        },
      ],
    },
    {
      title: 'Security & Important',
      description: 'Critical security and account notifications',
      items: [
        {
          key: 'securityAlerts' as keyof NotificationPreferences,
          label: 'Security Alerts',
          description: 'Login attempts, password changes, and security events',
        },
      ],
    },
    {
      title: 'Digest & Marketing',
      description: 'Periodic summaries and promotional content',
      items: [
        {
          key: 'weeklyDigest' as keyof NotificationPreferences,
          label: 'Weekly Digest',
          description: 'Weekly summary of your activity and platform updates',
        },
        {
          key: 'marketingEmails' as keyof NotificationPreferences,
          label: 'Marketing Emails',
          description: 'Product updates, tips, and promotional content',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {notificationGroups.map((group, groupIndex) => (
        <div key={group.title} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{group.title}</h3>
            <p className="text-sm text-muted-foreground">{group.description}</p>
          </div>
          
          <div className="space-y-4">
            {group.items.map((item, itemIndex) => (
              <div key={item.key} className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor={item.key} className="text-sm font-medium">
                    {item.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch
                  id={item.key}
                  checked={preferences[item.key]}
                  onCheckedChange={(checked) => updatePreference(item.key, checked)}
                  disabled={item.key !== 'emailNotifications' && !preferences.emailNotifications}
                />
              </div>
            ))}
          </div>
          
          {groupIndex < notificationGroups.length - 1 && <Separator />}
        </div>
      ))}

      {/* Status Message */}
      {message && (
        <Card className={cn(
          "border",
          message.type === 'success' ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <p className={cn(
                "text-sm",
                message.type === 'success' ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
              )}>
                {message.text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          <>
            <Bell className="h-4 w-4 mr-2" />
            Save Preferences
          </>
        )}
      </Button>
    </div>
  );
}