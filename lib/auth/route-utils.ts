import { getCurrentUserProfile } from './roles';
import { redirect } from 'next/navigation';

export async function redirectBasedOnRole() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  if (profile.status === 'rejected') {
    redirect('/auth/access-denied?reason=Account access denied');
  }

  if (profile.status === 'pending') {
    redirect('/auth/access-denied?reason=Account pending approval');
  }

  // Redirect based on role
  if (profile.role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/employee/chat');
  }
}

export function getDefaultRouteForRole(role: string): string {
  return role === 'admin' ? '/admin' : '/employee/chat';
}
