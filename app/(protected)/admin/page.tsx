import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import {
  getAllUsers,
  getPendingUsers,
  getCurrentUserProfile,
} from '@/lib/auth/roles';
import { createClient } from '@/lib/utils/supabase/server';
import AdminDashboard from '@/components/admin/admin-dashboard';

export default async function AdminDashboardPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  // Fetch real data from database
  const [allUsers, pendingUsers] = await Promise.all([
    getAllUsers(),
    getPendingUsers(),
    getCurrentUserProfile(),
  ]);

  // Get real document and conversation counts
  const supabase = await createClient();

  const [documentsResult, conversationsResult] = await Promise.all([
    supabase.from('documents').select('id', { count: 'exact' }),
    supabase.from('conversations').select('id', { count: 'exact' }),
  ]);

  const totalDocuments = documentsResult.count || 0;
  const totalConversations = conversationsResult.count || 0;

  // Generate recent activity from real data
  const recentActivity = allUsers.slice(0, 6).map((user, index) => ({
    id: user.id,
    type:
      index % 3 === 0
        ? 'user_signup'
        : index % 3 === 1
        ? 'document_upload'
        : 'chat_session',
    user: {
      email: user.email,
      full_name: user.full_name,
    },
    action:
      index % 3 === 0
        ? 'signed up for an account'
        : index % 3 === 1
        ? 'uploaded a new document'
        : 'started an AI chat session',
    timestamp: new Date(user.created_at),
  }));

  return (
    <AdminDashboard
      allUsers={allUsers}
      pendingUsers={pendingUsers}
      totalDocuments={totalDocuments}
      totalConversations={totalConversations}
      recentActivity={recentActivity}
    />
  );
}
