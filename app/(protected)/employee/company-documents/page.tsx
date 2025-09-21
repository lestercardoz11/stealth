import { requireApprovedUser, getCurrentUserProfile } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/server';
import { CompanyDocumentViewer } from '@/components/documents/company-document-viewer';

export default async function CompanyDocumentsPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  const profile = await getCurrentUserProfile();

  // Get only company-wide documents
  const supabase = await createClient();
  const { data: companyDocuments, error } = await supabase
    .from('documents')
    .select('*')
    .eq('is_company_wide', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company documents:', error);
  }

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-xl font-bold'>Company Documents</h1>
        <p className='text-xs text-muted-foreground'>
          Access company-wide documents and resources
        </p>
      </div>

      <CompanyDocumentViewer
        documents={companyDocuments || []}
        userProfile={profile}
      />
    </div>
  );
}
