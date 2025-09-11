import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { getAllDocuments } from '@/lib/actions/profile-actions';
import { AdminDocumentManager } from '@/components/documents/admin-document-manager';

export default async function AdminDocumentsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  // Fetch documents on the server side
  const documents = await getAllDocuments();

  return (
    <div className='space-y-3'>
      <div>
        <h1 className='text-xl font-bold'>Document Management</h1>
        <p className='text-xs text-muted-foreground'>
          Manage all documents and company-wide accessibility
        </p>
      </div>

      <AdminDocumentManager initialDocuments={documents} />
    </div>
  );
}
