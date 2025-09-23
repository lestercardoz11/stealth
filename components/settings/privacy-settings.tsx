'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Loader2,
  Shield,
  Check,
  AlertCircle,
  Trash2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface PrivacyPreferences {
  profileVisibility: boolean;
  activityTracking: boolean;
  dataCollection: boolean;
  thirdPartySharing: boolean;
  analyticsOptOut: boolean;
}

export function PrivacySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    profileVisibility: true,
    activityTracking: true,
    dataCollection: true,
    thirdPartySharing: false,
    analyticsOptOut: false,
  });

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would save to your backend/database
      localStorage.setItem('privacyPreferences', JSON.stringify(preferences));

      setMessage({
        type: 'success',
        text: 'Privacy settings saved successfully!',
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save privacy settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    setMessage({
      type: 'success',
      text: 'Data export request submitted. You will receive an email when ready.',
    });
  };

  const handleAccountDeletion = async () => {
    setMessage({
      type: 'success',
      text: 'Account deletion request submitted. Please check your email for confirmation.',
    });
  };

  const updatePreference = (key: keyof PrivacyPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const privacyGroups = [
    {
      title: 'Profile & Visibility',
      description: 'Control how your profile information is displayed',
      items: [
        {
          key: 'profileVisibility' as keyof PrivacyPreferences,
          label: 'Profile Visibility',
          description: 'Allow other users to see your profile information',
        },
      ],
    },
    {
      title: 'Data & Analytics',
      description: 'Manage how your data is collected and used',
      items: [
        {
          key: 'activityTracking' as keyof PrivacyPreferences,
          label: 'Activity Tracking',
          description: 'Track your usage patterns to improve the platform',
        },
        {
          key: 'dataCollection' as keyof PrivacyPreferences,
          label: 'Data Collection',
          description: 'Collect usage data for platform optimization',
        },
        {
          key: 'analyticsOptOut' as keyof PrivacyPreferences,
          label: 'Opt-out of Analytics',
          description: 'Exclude your data from analytics and reporting',
        },
      ],
    },
    {
      title: 'Third-party Sharing',
      description: 'Control data sharing with external services',
      items: [
        {
          key: 'thirdPartySharing' as keyof PrivacyPreferences,
          label: 'Third-party Data Sharing',
          description: 'Allow sharing anonymized data with trusted partners',
        },
      ],
    },
  ];

  return (
    <div className='space-y-6'>
      {privacyGroups.map((group, groupIndex) => (
        <div key={group.title} className='space-y-4'>
          <div>
            <h3 className='text-lg font-semibold'>{group.title}</h3>
            <p className='text-sm text-muted-foreground'>{group.description}</p>
          </div>

          <div className='space-y-4'>
            {group.items.map((item) => (
              <div
                key={item.key}
                className='flex items-center justify-between space-x-4'>
                <div className='flex-1 space-y-1'>
                  <Label htmlFor={item.key} className='text-sm font-medium'>
                    {item.label}
                  </Label>
                  <p className='text-sm text-muted-foreground'>
                    {item.description}
                  </p>
                </div>
                <Switch
                  id={item.key}
                  checked={preferences[item.key]}
                  onCheckedChange={(checked) =>
                    updatePreference(item.key, checked)
                  }
                />
              </div>
            ))}
          </div>

          {groupIndex < privacyGroups.length - 1 && <Separator />}
        </div>
      ))}

      {/* Data Rights */}
      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold'>Data Rights</h3>
          <p className='text-sm text-muted-foreground'>
            Exercise your rights regarding your personal data
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <Card className='p-4'>
            <CardContent className='p-0 space-y-3'>
              <div className='flex items-center gap-2'>
                <Download className='h-5 w-5 text-blue-600' />
                <h4 className='font-medium'>Export Data</h4>
              </div>
              <p className='text-sm text-muted-foreground'>
                Download a copy of all your personal data
              </p>
              <Button variant='outline' size='sm' onClick={handleDataExport}>
                Request Export
              </Button>
            </CardContent>
          </Card>

          <Card className='p-4'>
            <CardContent className='p-0 space-y-3'>
              <div className='flex items-center gap-2'>
                <Trash2 className='h-5 w-5 text-red-600' />
                <h4 className='font-medium'>Delete Account</h4>
              </div>
              <p className='text-sm text-muted-foreground'>
                Permanently delete your account and all data
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-red-600 hover:text-red-700'>
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleAccountDeletion}
                      className='bg-red-600 hover:bg-red-700'>
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <Card
          className={cn(
            'border',
            message.type === 'success'
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          )}>
          <CardContent className='p-3'>
            <div className='flex items-center gap-2'>
              {message.type === 'success' ? (
                <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
              ) : (
                <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
              )}
              <p
                className={cn(
                  'text-sm',
                  message.type === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                )}>
                {message.text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isLoading}
        className='w-full sm:w-auto'>
        {isLoading ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin mr-2' />
            Saving...
          </>
        ) : (
          <>
            <Shield className='h-4 w-4 mr-2' />
            Save Privacy Settings
          </>
        )}
      </Button>
    </div>
  );
}
