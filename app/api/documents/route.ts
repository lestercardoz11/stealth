import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { rateLimiter, RATE_LIMITS, validateFileName, sanitizeInput } from '@/lib/security/input-validation';
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
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
                    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const isCompanyWide = formData.get('isCompanyWide') === 'true';

    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
    }

    // Validate and sanitize inputs
    const sanitizedTitle = sanitizeInput(title);
    const titleValidation = validateFileName(sanitizedTitle);
    if (!titleValidation.isValid) {
      return NextResponse.json({ 
        error: `Invalid title: ${titleValidation.errors.join(', ')}` 
      }, { status: 400 });
    }
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
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
      .select('status, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'approved') {
      return NextResponse.json({ error: 'Account not approved' }, { status: 403 });
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
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: sanitizedTitle,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        is_company_wide: isCompanyWide,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('documents').remove([uploadData.path]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Log successful upload
    await auditLogger.log({
      userId: user.id,
      userEmail: profile.email,
      action: AUDIT_ACTIONS.DOCUMENT_UPLOADED,
      resource: 'Document Management',
      details: `Uploaded document: ${sanitizedTitle}`,
      ipAddress: clientIP,
      severity: 'low',
      metadata: {
        documentId: document.id,
        fileSize: file.size,
        fileType: file.type,
        isCompanyWide
      }
    });
    return NextResponse.json({ 
      success: true, 
      document,
      message: 'Document uploaded successfully' 
    });

  } catch (error) {
    console.error('Document upload error:', error);
    
    // Log error for security monitoring
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      await auditLogger.log({
        userId: user?.id,
        userEmail: user?.email,
        action: 'DOCUMENT_UPLOAD_ERROR',
        resource: 'Document Management',
        details: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        severity: 'high'
      });
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}