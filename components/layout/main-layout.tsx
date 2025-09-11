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
      <div className='min-h-screen bg-gradient-soft'>
        <div className='flex h-screen'>
          {/* Sidebar */}
          <Sidebar profile={profile} />

          {/* Main Content Area */}
          <div className='flex-1 flex flex-col overflow-hidden'>
            <div className='h-12 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 flex items-center justify-between px-3 md:px-4'>
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
            <main className='flex-1 overflow-y-auto bg-gradient-soft'>
              <div className='container mx-auto p-2 md:p-4'>
                <LoadingBoundary>{children}</LoadingBoundary>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
