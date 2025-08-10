import { requireApprovedUser, getCurrentUserProfile } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { getUserDocuments } from '@/lib/actions/profile-actions';
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

  // Fetch user's documents on the server side
  const documents = await getUserDocuments(profile.id);

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-3xl font-bold'>My Documents</h1>
        <p className='text-muted-foreground'>
          Manage your personal documents and files
        </p>
      </div>

      <EmployeeDocumentManager initialDocuments={documents} />
    </div>
  );
}
