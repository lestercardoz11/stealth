import { createClient } from '@/lib/utils/supabase/server';
import { searchDocuments } from '@/lib/ai/document-processor';
import { generateChatResponse } from '@/lib/ai/ollama-client';
import { rateLimiter, RATE_LIMITS } from '@/lib/security/input-validation';
import { auditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';

export async function POST(req: Request) {
  try {
    console.log('Chat stream API called');
    
    // Get client IP for rate limiting and audit logging
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    
    const { messages, documentIds } = await req.json();
    console.log('Chat request:', { messagesCount: messages?.length, documentIds });
    
    // Get the user's query (last message)
    const userQuery = messages[messages.length - 1]?.content;
    
    if (!userQuery) {
      return new Response('No query provided', { status: 400 });
    }

    // Input validation
    if (userQuery.length > 10000) {
      return new Response('Query too long', { status: 400 });
    }

    // Check if user is authenticated and approved
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response('Unauthorized', { status: 401 });
    }

    // Rate limiting
    const rateLimitKey = `chat:${user.id}`;
    if (!rateLimiter.isAllowed(rateLimitKey, RATE_LIMITS.CHAT.maxRequests, RATE_LIMITS.CHAT.windowMs)) {
      await auditLogger.log({
        userId: user.id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
        resource: 'Chat API',
        details: 'Chat rate limit exceeded',
        ipAddress: clientIP,
        severity: 'medium'
      });
      
      return new Response('Rate limit exceeded', { status: 429 });
    }

    // Check user profile and status
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role, email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'approved') {
      console.error('User not approved:', profile);
      return new Response('Account not approved', { status: 403 });
    }

    let context = '';
    let sources: Array<{
      documentId: string;
      documentTitle: string;
      similarity: number;
      content: string;
    }> = [];

    // If we have document IDs, get the full document content and search for relevant chunks
    if (documentIds && documentIds.length > 0) {
      try {
        console.log('Processing selected documents for context...', documentIds);
        
        // Get full content of selected documents
        const { data: selectedDocuments, error: docError } = await supabase
          .from('documents')
          .select('id, title, content')
          .in('id', documentIds);

        if (docError) {
          console.error('Error fetching selected documents:', docError);
        } else if (selectedDocuments && selectedDocuments.length > 0) {
          console.log(`Retrieved ${selectedDocuments.length} selected documents:`, 
            selectedDocuments.map(d => ({ id: d.id, title: d.title, contentLength: d.content?.length || 0 })));
          
          // Filter documents with content and create detailed context
          const documentsWithContent = selectedDocuments.filter(doc => 
            doc.content && doc.content.trim().length > 20
          );
          
          if (documentsWithContent.length > 0) {
            context = documentsWithContent
              .map((doc) => `=== DOCUMENT: ${doc.title} ===\n\n${doc.content}\n\n=== END DOCUMENT ===`)
              .join('\n\n');
            
            console.log(`Assembled context from ${documentsWithContent.length} documents with content`);
            console.log('Context preview:', context.substring(0, 500) + '...');
          } else {
            console.log('No documents with sufficient content found');
            context = selectedDocuments
              .map((doc) => `Document "${doc.title}" was selected but contains no readable content.`)
              .join('\n');
          }
          
          console.log(`Final context length: ${context.length} characters`);
          
          // Also search for most relevant chunks for source attribution
          try {
            const relevantChunks = await searchDocuments(
              userQuery,
              documentIds,
              0.2, // Lower threshold for better recall
              8 // More chunks for better coverage
            );

            if (relevantChunks && relevantChunks.length > 0) {
              sources = relevantChunks.map((chunk) => ({
                documentId: chunk.document_id,
                documentTitle: chunk.document_title,
                similarity: chunk.similarity,
                content: chunk.content.substring(0, 300) + (chunk.content.length > 300 ? '...' : ''),
              }));
              
              console.log(`Found ${relevantChunks.length} relevant chunks for source attribution`);
            } else {
              // If no chunks found, create sources from full documents
              sources = selectedDocuments
                .filter(doc => doc.content)
                .map((doc) => ({
                  documentId: doc.id,
                  documentTitle: doc.title,
                  similarity: 0.95, // High similarity since user explicitly selected
                  content: (doc.content || '').substring(0, 300) + ((doc.content || '').length > 300 ? '...' : ''),
                }));
              
              console.log(`Created sources from ${sources.length} selected documents`);
            }
          } catch (searchError) {
            console.error('Vector search error (non-fatal):', searchError);
            // Create basic sources from selected documents
            sources = selectedDocuments
              .filter(doc => doc.content)
              .map((doc) => ({
                documentId: doc.id,
                documentTitle: doc.title,
                similarity: 0.9,
                content: (doc.content || '').substring(0, 300) + ((doc.content || '').length > 300 ? '...' : ''),
              }));
          }
        } else {
          console.log('No documents found or no content available');
        }
      } catch (contextError) {
        console.error('Error assembling document context:', contextError);
        context = '';
        sources = [];
      }
    }

    console.log('Final context length:', context.length);
    console.log('Number of sources:', sources.length);

    // Generate response using Ollama with document context
    const response = await generateChatResponse(
      messages.map(m => ({ role: m.role, content: m.content })), 
      context
    );

    // Log successful chat interaction
    await auditLogger.log({
      userId: user.id,
      userEmail: profile.email,
      action: AUDIT_ACTIONS.AI_QUERY_PROCESSED,
      resource: 'Chat Stream API',
      details: `Processed AI query with ${documentIds?.length || 0} documents`,
      ipAddress: clientIP,
      severity: 'low',
      metadata: {
        documentCount: documentIds?.length || 0,
        queryLength: userQuery.length,
        responseLength: response.length,
        contextLength: context.length,
        sourcesCount: sources.length
      }
    });

    console.log('Chat response generated successfully');

    return new Response(JSON.stringify({ 
      response,
      sources 
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Chat stream API error:', error);
    
    // Log error for security monitoring
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      await auditLogger.log({
        userId: user?.id,
        userEmail: user?.email,
        action: 'CHAT_STREAM_API_ERROR',
        resource: 'Chat Stream API',
        details: `Chat stream API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        severity: 'high'
      });
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }
    
    return new Response('Internal server error', { status: 500 });
  }
}