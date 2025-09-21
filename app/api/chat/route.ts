import { createClient } from '@/lib/utils/supabase/server';
import { searchDocuments } from '@/lib/ai/document-processor';
import { rateLimiter, RATE_LIMITS } from '@/lib/security/input-validation';
import { auditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';

// Mock AI response generation for development
async function generateMockChatResponse(
  messages: Array<{ role: string; content: string }>,
  context?: string
): Promise<string> {
  const userQuery = messages[messages.length - 1]?.content || '';
  
  if (context) {
    return `Based on the provided documents, I can help you with "${userQuery}".

Here's my analysis:

${context ? `**Document Context Found:**
${context.substring(0, 500)}${context.length > 500 ? '...' : ''}

` : ''}**Legal Analysis:**
This appears to be a legal inquiry that would benefit from careful document review. Based on the available information, I recommend:

1. **Review the relevant clauses** mentioned in the documents
2. **Consider the legal implications** of the terms discussed
3. **Verify compliance** with applicable regulations
4. **Consult with qualified legal counsel** for specific legal advice

**Important Disclaimer:**
This analysis is for informational purposes only and does not constitute legal advice. Always consult with qualified legal counsel for specific legal matters.

Would you like me to elaborate on any specific aspect of this analysis?`;
  }

  return `I understand you're asking about "${userQuery}".

**General Legal Guidance:**
While I don't have specific document context for this query, I can provide some general guidance:

1. **Document Review Recommended:** For the most accurate analysis, please upload relevant documents
2. **Legal Research:** Consider reviewing applicable statutes and case law
3. **Professional Consultation:** Always consult with qualified legal counsel for specific matters

**To get more specific assistance:**
- Upload relevant documents using the document selector
- Select documents to provide context for your questions
- Ask specific questions about clauses, terms, or legal concepts

**Important Disclaimer:**
This response is for informational purposes only and does not constitute legal advice. Verify all information against original source documents and consult with qualified legal counsel.

How can I help you further with your legal research?`;
}

export async function POST(req: Request) {
  try {
    console.log('Chat API called');
    
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

    // If we have document IDs, search for relevant chunks
    if (documentIds && documentIds.length > 0) {
      try {
        console.log('=== DOCUMENT CONTEXT ASSEMBLY ===');
        console.log('Selected document IDs:', documentIds);
        // Search for relevant document chunks
        const relevantChunks = await searchDocuments(
          userQuery,
          documentIds,
          0.5, // Lower threshold for better results
          5
        );

          console.log(`Found ${selectedDocuments.length} selected documents:`, 
            selectedDocuments.map(d => ({ 
              id: d.id, 
              title: d.title, 
              hasContent: !!(d.content && d.content.trim().length > 20),
              contentLength: d.content?.length || 0 
            })));

          // Filter documents with meaningful content
          const documentsWithContent = selectedDocuments.filter(doc => 
            doc.content && doc.content.trim().length > 20
          );
          
          if (documentsWithContent.length > 0) {
            // Use full document content as context
            context = documentsWithContent
              .map((doc) => `=== DOCUMENT: ${doc.title} ===\n\n${doc.content}\n\n=== END DOCUMENT ===`)
              .join('\n\n');
            
            console.log(`Assembled context from ${documentsWithContent.length} documents with content`);
            console.log('Context length:', context.length);
            console.log('Context preview:', context.substring(0, 300) + '...');
          } else {
            console.log('No documents with sufficient content found');
            // Create a message about the selected documents
            context = `The user has selected the following documents for analysis:

${selectedDocuments.map(doc => `- "${doc.title}"`).join('\n')}

However, these documents may not contain extractable text content or may be in a format that requires special processing. Please acknowledge the document selection and provide guidance on how to better analyze these specific documents.`;
          }
          
          sources = relevantChunks.map((chunk) => ({
            documentId: chunk.document_id,
            documentTitle: chunk.document_title,
            similarity: chunk.similarity,
            content: chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''),
          }));
          
          console.log(`Using context from ${relevantChunks.length} document chunks`);
        }
      } catch (searchError) {
        console.error('Document search error:', searchError);
        // Continue without context if search fails
        context = '';
        sources = [];
      }
    }

    // Generate response using mock AI for development
    const response = await generateMockChatResponse(messages, context);

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