import { requireApprovedUser } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { UserGuide } from '@/components/help/user-guide';
import { FAQSection } from '@/components/help/faq-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  ExternalLink,
  Shield,
  Zap,
  FileText
} from 'lucide-react';

export default async function EmployeeHelpPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Help & Support</h1>
        <p className='text-muted-foreground'>
          Get help using Stealth AI and find answers to common questions
        </p>
      </div>

      {/* Quick Help Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='hover:shadow-md transition-shadow cursor-pointer'>
          <CardContent className='p-4 text-center'>
            <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3'>
              <MessageSquare className='h-6 w-6 text-blue-600' />
            </div>
            <h3 className='font-semibold mb-1'>AI Chat Guide</h3>
            <p className='text-sm text-muted-foreground'>
              Learn to use the AI chat effectively
            </p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow cursor-pointer'>
          <CardContent className='p-4 text-center'>
            <div className='w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3'>
              <FileText className='h-6 w-6 text-green-600' />
            </div>
            <h3 className='font-semibold mb-1'>Document Upload</h3>
            <p className='text-sm text-muted-foreground'>
              Best practices for uploading documents
            </p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow cursor-pointer'>
          <CardContent className='p-4 text-center'>
            <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3'>
              <Shield className='h-6 w-6 text-purple-600' />
            </div>
            <h3 className='font-semibold mb-1'>Privacy & Security</h3>
            <p className='text-sm text-muted-foreground'>
              Understanding data protection
            </p>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow cursor-pointer'>
          <CardContent className='p-4 text-center'>
            <div className='w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-3'>
              <Zap className='h-6 w-6 text-orange-600' />
            </div>
            <h3 className='font-semibold mb-1'>Quick Start</h3>
            <p className='text-sm text-muted-foreground'>
              Get started in 5 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Help Content */}
      <Tabs defaultValue='guide' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='guide' className='flex items-center gap-2'>
            <BookOpen className='h-4 w-4' />
            User Guide
          </TabsTrigger>
          <TabsTrigger value='faq' className='flex items-center gap-2'>
            <HelpCircle className='h-4 w-4' />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value='guide'>
          <UserGuide />
        </TabsContent>

        <TabsContent value='faq'>
          <FAQSection />
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='h-5 w-5' />
            Need Additional Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-3'>
              <h4 className='font-medium'>Contact Your Administrator</h4>
              <p className='text-sm text-muted-foreground'>
                For account issues, permissions, or platform-specific questions, 
                contact your system administrator.
              </p>
              <Button variant='outline' size='sm'>
                <Mail className='h-4 w-4 mr-2' />
                Contact Admin
              </Button>
            </div>
            
            <div className='space-y-3'>
              <h4 className='font-medium'>Technical Support</h4>
              <p className='text-sm text-muted-foreground'>
                For technical issues, bugs, or feature requests, reach out to 
                our support team.
              </p>
              <Button variant='outline' size='sm'>
                <ExternalLink className='h-4 w-4 mr-2' />
                Open Support Ticket
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}