import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/roles';
import { DocumentUpload } from '@/components/documents/document-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

export default async function AdminDocumentUploadPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/access-denied?reason=Admin access required');
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Upload Documents</h1>
        <p className='text-muted-foreground'>
          Upload documents and make them available company-wide
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Admin Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUpload 
            allowCompanyWide={true}
            onUploadComplete={(success, message) => {
              if (success) {
                // Could add toast notification here
                console.log('Upload successful:', message);
              } else {
                console.error('Upload failed:', message);
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}