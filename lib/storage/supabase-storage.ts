import { createClient } from '@/utils/supabase/client';
import { createClient as createServerClient } from '@/utils/supabase/server';

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export interface DocumentMetadata {
  title: string;
  fileSize: number;
  fileType: string;
  isCompanyWide?: boolean;
}

// Client-side storage functions
export async function uploadDocument(
  file: File,
  metadata: DocumentMetadata,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `documents/${user.id}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Save document metadata to database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: metadata.title,
        file_path: uploadData.path,
        file_size: metadata.fileSize,
        file_type: metadata.fileType,
        is_company_wide: metadata.isCompanyWide || false,
      });

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('documents').remove([uploadData.path]);
      return { success: false, error: dbError.message };
    }

    return { success: true, filePath: uploadData.path };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Get document info first
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      return false;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    return !dbError;
  } catch (error) {
    console.error('Delete document error:', error);
    return false;
  }
}

export async function getDocumentUrl(filePath: string): Promise<string | null> {
  try {
    const supabase = createClient();
    
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Get document URL error:', error);
    return null;
  }
}

// Server-side storage functions
export async function getDocuments(userId?: string, companyWideOnly = false) {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (companyWideOnly) {
    query = query.eq('is_company_wide', true);
  } else if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Get documents error:', error);
    return [];
  }

  return data || [];
}