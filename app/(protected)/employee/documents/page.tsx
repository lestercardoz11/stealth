import { requireApprovedUser } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default async function MyDocumentsPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>My Documents</h1>
        <p className='text-muted-foreground'>Manage your personal documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Document Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center text-muted-foreground py-12'>
            Document management will be implemented in the next step.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
