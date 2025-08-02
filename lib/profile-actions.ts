import { createClient } from '@/lib/utils/supabase/server';

import { createClient } from '@/lib/utils/supabase/server';

export async function updateUserProfile(userId: string, data: { full_name: string }) {
  'use server';
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);
  
  if (error) throw error;
}

export async function uploadUserAvatar(userId: string, file: File): Promise<string> {
  'use server';
  const supabase = await createClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function updateUserPassword(email: string, currentPassword: string, newPassword: string) {
  'use server';
  const supabase = await createClient();
  
  // First verify current password
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (verifyError) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

export async function getUserDocuments(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getAllDocuments() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getChatDocuments() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  // Get user's own documents and company-wide documents
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, created_at, is_company_wide, user_id')
    .or(`user_id.eq.${user.id},is_company_wide.eq.true`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}