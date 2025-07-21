import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { getDocuments } from '@/lib/storage/supabase-storage';
import { AdminDocumentManager } from '@/components/documents/admin-document-manager';

export default async function AdminDocumentsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  const documents = await getDocuments();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Document Management</h1>
        <p className='text-muted-foreground'>
          Manage all documents and company-wide accessibility
        </p>
      </div>

      <AdminDocumentManager initialDocuments={documents} />
    </div>
  );
}