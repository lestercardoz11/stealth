import { requireApprovedUser } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { DocumentUpload } from '@/components/documents/document-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';

export default async function EmployeeDocumentUploadPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Upload Documents</h1>
        <p className='text-muted-foreground'>
          Upload your personal documents for AI analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Personal Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUpload 
            allowCompanyWide={false}
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