import { requireApprovedUser, getCurrentUserProfile } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { getDocuments } from '@/lib/storage/document-api';
import { CompanyDocumentViewer } from '@/components/documents/company-document-viewer';

export default async function CompanyDocumentsPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  const profile = await getCurrentUserProfile();
  const documentsResult = await getDocuments(undefined, true); // Get only company-wide documents
  const companyDocuments = documentsResult.success ? documentsResult.documents || [] : [];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Company Documents</h1>
        <p className='text-muted-foreground'>
          Access company-wide documents and resources
        </p>
      </div>

      <CompanyDocumentViewer 
        documents={companyDocuments} 
        userProfile={profile}
      />
    </div>
  );
}