import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import {
  getAllUsers,
  getPendingUsers,
  getCurrentUserProfile,
} from '@/lib/auth/roles';
import AdminDashboard from '@/components/admin/admin-dashboard';

export default async function AdminDashboardPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  const [allUsers, pendingUsers, currentAdmin] = await Promise.all([
    getAllUsers(),
    getPendingUsers(),
    getCurrentUserProfile(),
  ]);

  return (
    <AdminDashboard
      allUsers={allUsers}
      pendingUsers={pendingUsers}
      currentAdmin={currentAdmin}
    />
  );
}
