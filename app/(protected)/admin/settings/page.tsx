import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { SystemConfiguration } from '@/components/admin/settings/system-configuration';
import { SecuritySettings } from '@/components/admin/settings/security-settings';
import { BrandingSettings } from '@/components/admin/settings/branding-settings';
import { DataRetentionSettings } from '@/components/admin/settings/data-retention-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Server, Shield, Palette, Database } from 'lucide-react';

export default async function AdminSettingsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>System Settings</h1>
        <p className='text-muted-foreground'>
          Configure system-wide settings and preferences
        </p>
      </div>

      <div className='grid gap-6'>
        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Server className='h-5 w-5' />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SystemConfiguration />
          </CardContent>
        </Card>

        <Separator />

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SecuritySettings />
          </CardContent>
        </Card>

        <Separator />

        {/* Company Branding */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Palette className='h-5 w-5' />
              Company Branding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BrandingSettings />
          </CardContent>
        </Card>

        <Separator />

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Database className='h-5 w-5' />
              Data Retention Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataRetentionSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
