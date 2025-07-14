import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export default async function AdminDashboardPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  return <AdminDashboard />;
}
