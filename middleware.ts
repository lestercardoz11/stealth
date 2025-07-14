import { updateSession } from '@/utils/supabase/middleware';
import {
  getProfileFromRequest,
  createUnauthorizedResponse,
  createForbiddenResponse,
  isAdminRoute,
  isProtectedRoute,
  requiresApproval,
} from '@/lib/auth/middleware-utils';
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { hasEnvVars } from '@/lib/utils';

export async function middleware(request: NextRequest) {
  // First, update the session
  const response = await updateSession(request);

  // If env vars are not set, skip role-based checks
  if (!hasEnvVars) {
    return response;
  }

  const { pathname } = request.nextUrl;

  // Skip middleware for auth routes, static files, and API routes
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/' ||
    pathname === '/auth/access-denied'
  ) {
    return response;
  }

  // Handle dashboard redirect - redirect to role-appropriate route
  if (pathname === '/dashboard') {
    const profile = await getProfileFromRequest(request);
    if (!profile) {
      return createUnauthorizedResponse(request, 'Authentication required');
    }

    if (profile.status === 'rejected') {
      return createForbiddenResponse(request, 'Account access denied');
    }

    if (profile.status === 'pending') {
      return createForbiddenResponse(request, 'Account pending approval');
    }

    // Redirect to role-appropriate dashboard
    const url = request.nextUrl.clone();
    url.pathname = profile.role === 'admin' ? '/admin' : '/employee/chat';
    return NextResponse.redirect(url);
  }

  // Handle protected route groups
  const isAdminPath = pathname.startsWith('/admin');
  const isAppPath = pathname.startsWith('/employee');

  if (isAdminPath || isAppPath) {
    const profile = await getProfileFromRequest(request);

    // No profile means user is not authenticated
    if (!profile) {
      return createUnauthorizedResponse(request, 'Authentication required');
    }

    // Check if user is rejected
    if (profile.status === 'rejected') {
      return createForbiddenResponse(request, 'Account access denied');
    }

    // Check if user is pending approval
    if (profile.status === 'pending') {
      return createForbiddenResponse(request, 'Account pending approval');
    }

    // Check admin routes
    if (isAdminPath && profile.role !== 'admin') {
      return createForbiddenResponse(request, 'Admin access required');
    }

    // Check employee routes (redirect admin to admin area)
    if (isAppPath && profile.role === 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
