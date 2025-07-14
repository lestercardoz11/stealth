import { createClient } from '@/utils/supabase/server';
import { createClient as createBrowserClient } from '@/utils/supabase/client';
import { UserRole, UserStatus, Profile } from '@/lib/types/database';

/**
 * Server-side role checking utilities
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return profile;
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile?.role === 'admin' && profile?.status === 'approved';
}

export async function isApprovedUser(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile?.status === 'approved';
}

export async function hasRole(role: UserRole): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile?.role === role && profile?.status === 'approved';
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== 'admin' || profile.status !== 'approved') {
    throw new Error('Admin access required');
  }
  return profile;
}

export async function requireApprovedUser(): Promise<Profile> {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.status !== 'approved') {
    throw new Error('Approved user access required');
  }
  return profile;
}

/**
 * Client-side role checking utilities
 */
export async function getCurrentUserProfileClient(): Promise<Profile | null> {
  const supabase = createBrowserClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return profile;
}

export async function isAdminClient(): Promise<boolean> {
  const profile = await getCurrentUserProfileClient();
  return profile?.role === 'admin' && profile?.status === 'approved';
}

export async function isApprovedUserClient(): Promise<boolean> {
  const profile = await getCurrentUserProfileClient();
  return profile?.status === 'approved';
}

export async function hasRoleClient(role: UserRole): Promise<boolean> {
  const profile = await getCurrentUserProfileClient();
  return profile?.role === role && profile?.status === 'approved';
}

/**
 * Admin utilities for managing users
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<void> {
  await requireAdmin(); // Ensure current user is admin

  const supabase = createClient();
  const { error } = await (await supabase)
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<void> {
  await requireAdmin(); // Ensure current user is admin

  const supabase = createClient();
  const { error } = await (await supabase)
    .from('profiles')
    .update({ status })
    .eq('id', userId);

  if (error) throw error;
}

export async function getAllUsers(): Promise<Profile[]> {
  await requireAdmin(); // Ensure current user is admin

  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPendingUsers(): Promise<Profile[]> {
  await requireAdmin(); // Ensure current user is admin

  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from('profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
