import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Activity, Users, FileText, AlertTriangle } from 'lucide-react';
import { SecurityStatus } from '@/components/security/security-status';
import { AuditLog } from '@/components/security/audit-log';
import { SessionManager } from '@/components/security/session-manager';
import { DataExport } from '@/components/security/data-export';
import { ComplianceIndicator } from '@/components/security/compliance-indicator';

export default async function AdminSecurityPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-xl font-bold'>Security Dashboard</h1>
        <p className='text-sm text-muted-foreground'>
          Monitor security status, audit logs, and compliance
        </p>
      </div>

      {/* Security Overview */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Security Score
            </CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>98/100</div>
            <p className='text-xs text-muted-foreground'>
              Excellent security posture
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Sessions
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>24</div>
            <p className='text-xs text-muted-foreground'>Currently logged in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Security Events
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>156</div>
            <p className='text-xs text-muted-foreground'>Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Failed Logins</CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>3</div>
            <p className='text-xs text-muted-foreground'>Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Status and Compliance */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <SecurityStatus variant='detailed' />
        <ComplianceIndicator variant='detailed' showDetails={true} />
      </div>

      <Separator />

      {/* Session Management */}
      <SessionManager />

      <Separator />

      {/* Audit Log */}
      <AuditLog />

      <Separator />

      {/* Data Export and Privacy */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <DataExport />

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Privacy & Compliance Tools
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='p-3 border rounded-lg'>
                <h4 className='font-medium mb-1'>Data Retention Policy</h4>
                <p className='text-sm text-muted-foreground mb-2'>
                  Automatically manage data lifecycle and retention
                </p>
                <div className='text-xs text-green-600'>
                  ✓ Active - 365 days retention
                </div>
              </div>

              <div className='p-3 border rounded-lg'>
                <h4 className='font-medium mb-1'>GDPR Compliance</h4>
                <p className='text-sm text-muted-foreground mb-2'>
                  Right to be forgotten and data portability
                </p>
                <div className='text-xs text-green-600'>✓ Fully compliant</div>
              </div>

              <div className='p-3 border rounded-lg'>
                <h4 className='font-medium mb-1'>Audit Trail</h4>
                <p className='text-sm text-muted-foreground mb-2'>
                  Complete audit trail for all user actions
                </p>
                <div className='text-xs text-green-600'>
                  ✓ Enabled - 7 year retention
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
