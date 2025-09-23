import { updateSession } from '@/lib/utils/supabase/middleware';
import {
  getProfileFromRequest,
  createUnauthorizedResponse,
  createForbiddenResponse,
} from '@/lib/auth/middleware-utils';
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { hasEnvVars } from '@/lib/utils/utils';
import { rateLimiter } from '@/lib/security/input-validation';
import { auditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';

export async function middleware(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
  
  // First, update the session
  const response = await updateSession(request);

  // If env vars are not set, skip role-based checks
  if (!hasEnvVars) {
    return response;
  }

  const { pathname } = request.nextUrl;

  // Rate limiting for sensitive endpoints
  if (pathname.startsWith('/api/')) {
    const rateLimitKey = `api:${clientIP}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 100, 60 * 1000)) { // 100 requests per minute
      await auditLogger.log({
        action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
        resource: 'API',
        details: `API rate limit exceeded for ${pathname}`,
        ipAddress: clientIP,
        severity: 'medium'
      });
      
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }
  }
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
      await auditLogger.log({
        userId: profile.id,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS_ATTEMPT,
        resource: 'Route Access',
        details: `Rejected user attempted to access ${pathname}`,
        ipAddress: clientIP,
        severity: 'high'
      });
      return createForbiddenResponse(request, 'Account access denied');
    }

    // Check if user is pending approval
    if (profile.status === 'pending') {
      await auditLogger.log({
        userId: profile.id,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS_ATTEMPT,
        resource: 'Route Access',
        details: `Pending user attempted to access ${pathname}`,
        ipAddress: clientIP,
        severity: 'medium'
      });
      return createForbiddenResponse(request, 'Account pending approval');
    }

    // Check admin routes
    if (isAdminPath && profile.role !== 'admin') {
      await auditLogger.log({
        userId: profile.id,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS_ATTEMPT,
        resource: 'Admin Route',
        details: `Non-admin user attempted to access ${pathname}`,
        ipAddress: clientIP,
        severity: 'high'
      });
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
