import { getCurrentUserProfile } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { UnifiedNavigation } from './unified-navigation';
import { LoadingBoundary } from './loading-boundary';
import { ErrorBoundary } from './error-boundary';

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
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
        {/* Unified Navigation */}
        <UnifiedNavigation profile={profile} />

        {/* Main Content */}
        <main className='min-h-[calc(100vh-4rem)]'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <LoadingBoundary>{children}</LoadingBoundary>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
