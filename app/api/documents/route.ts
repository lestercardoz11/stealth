import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { processDocumentText } from '@/lib/ai/document-processor';
import { rateLimiter, RATE_LIMITS } from '@/lib/security/input-validation';
import { auditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const companyWideOnly = searchParams.get('companyWideOnly') === 'true';

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user profile and status
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'approved') {
      return NextResponse.json({ error: 'Account not approved' }, { status: 403 });
    }

    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (companyWideOnly) {
      query = query.eq('is_company_wide', true);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (profile.role !== 'admin') {
      // Non-admin users can only see their own documents and company-wide documents
      query = query.or(`user_id.eq.${user.id},is_company_wide.eq.true`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ documents: data || [] });

  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Document upload API called');
    
    // Get client IP for rate limiting and audit logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const isCompanyWide = formData.get('isCompanyWide') === 'true';

    console.log('Upload request data:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      title,
      isCompanyWide
    });

    if (!file || !title) {
      console.error('Missing file or title');
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitKey = `upload:${user.id}`;
    if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.UPLOAD.maxRequests, RATE_LIMITS.UPLOAD.windowMs)) {
      await auditLogger.log({
        userId: user.id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
        resource: 'Document Upload',
        details: 'Upload rate limit exceeded',
        ipAddress: clientIP,
        severity: 'medium'
      });
      
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Check user profile and status
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role, email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'approved') {
      console.error('User not approved:', profile);
      return NextResponse.json({ error: 'Account not approved' }, { status: 403 });
    }

    // Extract text content based on file type
    let extractedText = '';
    try {
      console.log('Extracting text from file type:', file.type);
      const fileBuffer = await file.arrayBuffer();

      if (file.type === 'text/plain') {
        // For text files, we can extract the content directly
        const uint8Array = new Uint8Array(fileBuffer);
        const decoder = new TextDecoder('utf-8');
        extractedText = decoder.decode(uint8Array);
        console.log('Extracted text length:', extractedText.length);
      } else {
        // For other file types, create descriptive content for now
        extractedText = `Document: ${title}

This is a ${file.type.includes('pdf') ? 'PDF' : file.type.includes('word') ? 'Word' : 'document'} file that has been uploaded to the Stealth AI platform.

File Details:
- Title: ${title}
- Type: ${file.type}
- Size: ${Math.round(file.size / 1024)} KB
- Uploaded: ${new Date().toISOString()}

This document can be analyzed by the AI assistant for legal research and document analysis. The content is processed locally and never sent to external services, ensuring complete privacy and security.

${isCompanyWide ? 'This document is available company-wide for all employees to access and analyze.' : 'This is a personal document accessible only to the uploader.'}`;
        
        console.log('Generated descriptive content for non-text file');
      }
    } catch (extractError) {
      console.error('Text extraction error:', extractError);
      // Continue with basic metadata if extraction fails
      extractedText = `Document: ${title}\n\nThis document has been uploaded to the system and can be analyzed by the AI assistant. File size: ${Math.round(file.size / 1024)} KB.`;
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    console.log('Uploading to storage path:', filePath);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    console.log('File uploaded successfully:', uploadData);

    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title,
        content: extractedText,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        is_company_wide: isCompanyWide,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('documents').remove([uploadData.path]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    console.log('Document record created:', document);

    // Log successful upload
    await auditLogger.log({
      userId: user.id,
      userEmail: profile.email,
      action: AUDIT_ACTIONS.DOCUMENT_UPLOADED,
      resource: 'Document Management',
      details: `Uploaded document: ${title}`,
      ipAddress: clientIP,
      severity: 'low',
      metadata: {
        documentId: document.id,
        fileSize: file.size,
        fileType: file.type,
        isCompanyWide
      }
    });

    // Process document for vector search (with error handling)
    try {
      console.log('Starting document processing for vector search');
      await processDocumentText(document.id, extractedText, {
        title,
        fileType: file.type,
        fileSize: file.size,
        isCompanyWide,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString()
      });
      console.log('Document vector processing completed successfully');
    } catch (processError) {
      console.error('Document processing error (non-fatal):', processError);
      // Log processing error but don't fail the upload
      await auditLogger.log({
        userId: user.id,
        userEmail: profile.email,
        action: 'DOCUMENT_PROCESSING_FAILED',
        resource: 'Document Processing',
        details: `Failed to process document for vector search: ${title}`,
        ipAddress: clientIP,
        severity: 'medium',
        metadata: {
          documentId: document.id,
          error: processError instanceof Error ? processError.message : 'Unknown error'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      document,
      message: 'Document uploaded successfully' 
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}