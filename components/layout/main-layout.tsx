import { getCurrentUserProfile } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { LoadingBoundary } from './loading-boundary';
import { ErrorBoundary } from '../ui/error-boundary';
import { Sidebar } from './sidebar';
import { TopNavigation } from './top-navigation';
import { MobileNavigation } from './mobile-navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export async function MainLayout({ children }: MainLayoutProps) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.status === 'rejected') {
    redirect('/auth/access-denied?reason=Account access denied');
  }

  return (
    <ErrorBoundary>
      <div className='min-h-screen bg-background'>
        <div className='flex h-screen'>
          {/* Sidebar */}
          <Sidebar profile={profile} />

          {/* Main Content Area */}
          <div className='flex-1 flex flex-col overflow-hidden'>
            <div className='h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6'>
              {/* Mobile Navigation */}
              <div className='md:hidden'>
                <MobileNavigation profile={profile} />
              </div>
              
              {/* Desktop Navigation */}
              <div className='hidden md:block flex-1'>
                <TopNavigation profile={profile} />
              </div>
            </div>

            {/* Main Content */}
            <main className='flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50'>
              <div className='container mx-auto'>
                <LoadingBoundary>{children}</LoadingBoundary>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
