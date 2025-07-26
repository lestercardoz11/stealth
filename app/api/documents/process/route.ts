import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { processDocumentText } from '@/lib/ai/document-processor';

export async function POST(request: NextRequest) {
  try {
    const { documentId, text, metadata = {} } = await request.json();

    if (!documentId || !text) {
      return NextResponse.json(
        { error: 'Document ID and text are required' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('user_id, title')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user owns the document or is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (document.user_id !== user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Process the document
    await processDocumentText(documentId, text, {
      ...metadata,
      documentTitle: document.title,
      processedBy: user.id,
      processedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Document processed successfully',
      documentId,
    });

  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}