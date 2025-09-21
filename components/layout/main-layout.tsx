import { getCurrentUserProfile } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import { LoadingBoundary } from './loading-boundary';
import { ErrorBoundary } from '../ui/error-boundary';
import { AppSidebar } from './sidebar';
import { SidebarInset, SidebarProvider } from '../ui/sidebar';

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
      <SidebarProvider>
        <AppSidebar profile={profile} />

        <SidebarInset>
          <div className='min-h-screen bg-gradient-soft'>
            <div className='flex h-screen'>
              <div className='flex-1 flex flex-col overflow-hidden'>
                {/* Main Content */}
                <main className='flex-1 overflow-y-auto bg-gradient-soft'>
                  <div className='container mx-auto'>
                    <LoadingBoundary>{children}</LoadingBoundary>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
