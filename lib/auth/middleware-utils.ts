import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole, UserStatus } from '@/lib/types/database';

export interface MiddlewareProfile {
  id: string;
  role: UserRole;
  status: UserStatus;
}

export async function getProfileFromRequest(
  request: NextRequest
): Promise<MiddlewareProfile | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No-op for middleware
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role, status')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return profile;
}

export function createUnauthorizedResponse(
  request: NextRequest,
  reason: string = 'Unauthorized'
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  url.searchParams.set('error', reason);
  return NextResponse.redirect(url);
}

export function createForbiddenResponse(
  request: NextRequest,
  reason: string = 'Access denied'
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/access-denied';
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url);
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/documents',
    '/conversations',
    '/chat',
    '/admin',
    '/profile',
  ];

  return protectedPaths.some((path) => pathname.startsWith(path));
}

export function requiresApproval(pathname: string): boolean {
  const approvalRequiredPaths = [
    '/dashboard',
    '/documents',
    '/conversations',
    '/chat',
  ];

  return approvalRequiredPaths.some((path) => pathname.startsWith(path));
}
