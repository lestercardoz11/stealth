import { requireApprovedUser, getCurrentUserProfile } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { getDocuments } from '@/lib/storage/supabase-storage';
import { EmployeeDocumentManager } from '@/components/documents/employee-document-manager';
import { getUserDocuments } from '@/lib/profile-actions';
export default async function EmployeeDocumentsPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect('/auth/login');
  }

  const userDocuments = await getDocuments(profile.id);

  const handleRefreshDocuments = async () => {
    'use server';
    return await getUserDocuments(profile.id);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>My Documents</h1>
        <p className='text-muted-foreground'>
          Manage your personal documents and files
        </p>
      </div>

      <EmployeeDocumentManager 
        initialDocuments={userDocuments}
        userProfile={profile}
        onRefreshDocuments={handleRefreshDocuments}
      />
    </div>
  );
}