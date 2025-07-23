import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { getDocuments } from '@/lib/storage/document-api';
import { AdminDocumentManager } from '@/components/documents/admin-document-manager';

export default async function AdminDocumentsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  const documentsResult = await getDocuments();
  const documents = documentsResult.success
    ? documentsResult.documents || []
    : [];

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-3xl font-bold'>Document Management</h1>
        <p className='text-muted-foreground'>
          Manage all documents and company-wide accessibility
        </p>
      </div>

      <AdminDocumentManager
        initialDocuments={documents}
        onRefreshDocuments={async () => {
          'use server';
          // This will trigger a page refresh to reload the documents
          // In a real app, you might want to use revalidatePath or similar
        }}
      />
    </div>
  );
}
