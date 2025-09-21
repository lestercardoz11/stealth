import { requireApprovedUser } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { UserGuide } from '@/components/help/user-guide';
import { FAQSection } from '@/components/help/faq-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default async function EmployeeHelpPage() {
  try {
    await requireApprovedUser();
  } catch {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-xl font-bold'>Help & Support</h1>
        <p className='text-xs text-muted-foreground'>
          Get help using Stealth AI and find answers to common questions
        </p>
      </div>

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
      <Card className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800'>
        <CardContent className='p-6 text-center'>
          <HelpCircle className='h-8 w-8 text-blue-600 mx-auto mb-3' />
          <h3 className='font-semibold mb-2'>Still need help?</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Can&apos;t find the answer you&apos;re looking for? Contact your
            administrator or reach out to our support team.
          </p>
          <div className='flex justify-center gap-2'>
            <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'>
              Contact Support
            </button>
            <button className='px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm'>
              Request Feature
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
