import { requireApprovedUser, getCurrentUserProfile } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { getDocuments } from '@/lib/storage/document-api';
import { EmployeeDocumentManager } from '@/components/documents/employee-document-manager';

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

  const documentsResult = await getDocuments(profile.id);
  const userDocuments = documentsResult.success ? documentsResult.documents || [] : [];

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
        onRefreshDocuments={async () => {
          'use server';
          // This will trigger a page refresh to reload the documents
          // In a real app, you might want to use revalidatePath or similar
        }}
      />
    </div>
  );
}