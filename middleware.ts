import { updateSession } from "@/lib/supabase/middleware";
import { 
  getProfileFromRequest, 
  createUnauthorizedResponse, 
  createForbiddenResponse,
  isAdminRoute,
  isProtectedRoute,
  requiresApproval
} from "@/lib/auth/middleware-utils";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { hasEnvVars } from "@/lib/utils";

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
    pathname === '/access-denied'
  ) {
    return response;
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    const profile = await getProfileFromRequest(request);
    
    // No profile means user is not authenticated
    if (!profile) {
      return createUnauthorizedResponse(request, 'Authentication required');
    }

    // Check if user is pending approval for routes that require approval
    if (requiresApproval(pathname) && profile.status === 'pending') {
      return createForbiddenResponse(request, 'Account pending approval');
    }

    // Check if user is rejected
    if (profile.status === 'rejected') {
      return createForbiddenResponse(request, 'Account access denied');
    }

    // Check admin routes
    if (isAdminRoute(pathname)) {
      if (profile.role !== 'admin' || profile.status !== 'approved') {
        return createForbiddenResponse(request, 'Admin access required');
      }
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
