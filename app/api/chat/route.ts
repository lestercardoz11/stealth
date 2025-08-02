import { generateChatResponse } from '@/lib/ai/ollama-client';
import { createClient } from '@/lib/utils/supabase/server';
import { searchDocuments } from '@/lib/ai/document-processor';
import { rateLimiter, RATE_LIMITS } from '@/lib/security/input-validation';
import { auditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting and audit logging
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    
    const { messages, documentIds } = await req.json();
    
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
      return new Response('Account not approved', { status: 403 });
    }

    let context = '';
    interface Source {
      documentId: string;
      documentTitle: string;
      similarity: number;
      content: string;
    }
    let sources: Source[] = [];

    // If we have document IDs or should search all accessible documents
    if (documentIds && documentIds.length > 0) {
      try {
        // Search for relevant document chunks
        const relevantChunks = await searchDocuments(
          userQuery,
          documentIds,
          0.7,
          5
        );

        if (relevantChunks && relevantChunks.length > 0) {
          interface Chunk {
            document_title: string;
            content: string;
            document_id: string;
            similarity: number;
          }
          context = relevantChunks
            .map((chunk: Chunk) => `Document: ${chunk.document_title}\nContent: ${chunk.content}`)
            .join('\n\n---\n\n');
          
          sources = relevantChunks.map((chunk: Chunk) => ({
            documentId: chunk.document_id,
            documentTitle: chunk.document_title,
            similarity: chunk.similarity,
            content: chunk.content.substring(0, 200) + '...',
          }));
        }
      } catch (searchError) {
        console.error('Document search error:', searchError);
        // Continue without context if search fails
      }
    }

    // Generate response using Ollama
    const response = await generateChatResponse(messages, context);

    // Log successful chat interaction
    await auditLogger.log({
      userId: user.id,
      userEmail: profile.email,
      action: AUDIT_ACTIONS.AI_QUERY_PROCESSED,
      resource: 'Chat API',
      details: `Processed AI query with ${documentIds?.length || 0} documents`,
      ipAddress: clientIP,
      severity: 'low',
      metadata: {
        documentCount: documentIds?.length || 0,
        queryLength: userQuery.length,
        responseLength: response.length
      }
    });
    // Save the conversation to database
    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: userQuery.substring(0, 100) + '...',
        })
        .select()
        .single();

      if (conversation && !convError) {
        // Save user message
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          role: 'user',
          content: userQuery,
        });

        // Save assistant message
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content: response,
        });
      }
    } catch (saveError) {
      console.error('Error saving conversation:', saveError);
    }

    return new Response(JSON.stringify({ 
      response,
      sources 
    }), {
      headers: {
        'Content-Type': 'application/json',
        'X-Sources': JSON.stringify(sources),
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Log error for security monitoring
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      await auditLogger.log({
        userId: user?.id,
        userEmail: user?.email,
        action: 'CHAT_API_ERROR',
        resource: 'Chat API',
        details: `Chat API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        severity: 'high'
      });
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }
    
    return new Response('Internal server error', { status: 500 });
  }
}