import { Document } from "../types/database";

export interface DocumentUploadResult {
  success: boolean;
  document?: Document;
  error?: string;
  message?: string;
}

export interface DocumentListResult {
  success: boolean;
  documents?: Document[];
  error?: string;
}

export interface DocumentUrlResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadDocument(
  file: File,
  title: string,
  isCompanyWide: boolean = false
): Promise<DocumentUploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('isCompanyWide', isCompanyWide.toString());

    const response = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Upload failed' };
    }

    return {
      success: true,
      document: data.document,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function getDocuments(
  userId?: string,
  companyWideOnly: boolean = false
): Promise<DocumentListResult> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (companyWideOnly) params.append('companyWideOnly', 'true');

    const response = await fetch(`/api/documents?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch documents' };
    }

    return {
      success: true,
      documents: data.documents,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch documents',
    };
  }
}

export async function deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Delete failed' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

export async function getDocumentUrl(filePath: string): Promise<DocumentUrlResult> {
  try {
    const response = await fetch('/api/documents/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to get URL' };
    }

    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get URL',
    };
  }
}