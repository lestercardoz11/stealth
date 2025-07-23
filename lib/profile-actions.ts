import { createClient } from '@/utils/supabase/server';

import { getDocuments as getDocumentsAPI } from '@/lib/storage/document-api';

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
  const result = await getDocumentsAPI(userId);
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch documents');
  }
  return result.documents || [];
}

export async function getAllDocuments() {
  const result = await getDocumentsAPI();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch documents');
  }
  return result.documents || [];
}

export async function getChatDocuments() {
  const result = await getDocumentsAPI();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch documents');
  }
  // Return only the fields needed for chat
  return (result.documents || []).map(doc => ({
    id: doc.id,
    title: doc.title,
    created_at: doc.created_at,
    is_company_wide: doc.is_company_wide,
    user_id: doc.user_id
  }));
}