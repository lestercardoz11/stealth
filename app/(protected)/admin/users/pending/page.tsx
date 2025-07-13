import { redirect } from 'next/navigation';
import { requireAdmin, getPendingUsers } from '@/lib/auth/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagement } from '@/components/admin/user-management';

export default async function PendingUsersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  const pendingUsers = await getPendingUsers();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Pending Approvals</h1>
        <p className='text-muted-foreground'>
          Review and approve new user registrations
        </p>
      </div>

      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center text-muted-foreground'>
              No pending user approvals at this time.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Pending User Approvals ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserManagement users={pendingUsers} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
