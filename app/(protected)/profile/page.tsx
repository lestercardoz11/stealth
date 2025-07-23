import { requireApprovedUser, getCurrentUserProfile } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile/profile-form';
import { PasswordChange } from '@/components/profile/password-change';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Settings } from 'lucide-react';

export default async function ProfilePage() {
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
        <h1 className='text-3xl font-bold'>Profile Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>

      <div className='grid gap-6'>
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        <Separator />

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Lock className='h-5 w-5' />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordChange />
          </CardContent>
        </Card>

        <Separator />

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Role
                </label>
                <p className='text-sm capitalize'>{profile.role}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Status
                </label>
                <p className='text-sm capitalize'>{profile.status}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Member Since
                </label>
                <p className='text-sm'>
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>
                  Last Updated
                </label>
                <p className='text-sm'>
                  {new Date(profile.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
