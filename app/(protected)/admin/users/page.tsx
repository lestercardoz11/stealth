import { redirect } from 'next/navigation';
import { requireAdmin, getAllUsers } from '@/lib/auth/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagement } from '@/components/admin/user-management';

export default async function AllUsersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  const allUsers = await getAllUsers();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>All Users</h1>
        <p className='text-muted-foreground'>Manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagement users={allUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
