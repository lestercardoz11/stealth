import { requireApprovedUser, getCurrentUserProfile } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { ThemeSettings } from '@/components/settings/theme-settings';
import { PrivacySettings } from '@/components/settings/privacy-settings';
import { LanguageSettings } from '@/components/settings/language-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bell, Palette, Shield, Globe } from 'lucide-react';

export default async function SettingsPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect('/auth/login');
  }

  return (
    <div className='space-y-6 md:p-6'>
      <div>
        <h1 className='text-3xl font-bold'>Settings</h1>
        <p className='text-muted-foreground'>
          Customize your experience and preferences
        </p>
      </div>

      <div className='grid gap-6'>
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Palette className='h-5 w-5' />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeSettings />
          </CardContent>
        </Card>

        <Separator />

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bell className='h-5 w-5' />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationSettings />
          </CardContent>
        </Card>

        <Separator />

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PrivacySettings />
          </CardContent>
        </Card>

        <Separator />

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Globe className='h-5 w-5' />
              Language & Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
