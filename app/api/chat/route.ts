import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { searchDocuments } from '@/lib/ai/document-processor';

export async function POST(req: Request) {
  try {
    const { messages, documentIds } = await req.json();
    
    // Get the user's query (last message)
    const userQuery = messages[messages.length - 1]?.content;
    
    if (!userQuery) {
      return new Response('No query provided', { status: 400 });
    }

    // Check if user is authenticated and approved
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Check user profile and status
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'approved') {
      return new Response('Account not approved', { status: 403 });
    }

    let context = '';
    let sources: any[] = [];

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
          context = relevantChunks
            .map((chunk: any) => `Document: ${chunk.document_title}\nContent: ${chunk.content}`)
            .join('\n\n---\n\n');
          
          sources = relevantChunks.map((chunk: any) => ({
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

    // Create system prompt with context
    const systemPrompt = `You are Stealth AI, a professional legal document assistant designed specifically for law firms. You provide accurate, well-reasoned legal analysis while maintaining the highest standards of professionalism.

${context ? `DOCUMENT CONTEXT:
${context}

INSTRUCTIONS:
- Base your responses primarily on the provided document context
- If the context doesn't contain sufficient information to answer the question, clearly state this limitation
- When referencing information from documents, be specific about which document you're citing
- Maintain professional legal language and terminology
- Flag any potential legal issues, risks, or areas requiring further review
- If you identify conflicting information in the documents, highlight these discrepancies
- Suggest next steps or additional research when appropriate

` : `INSTRUCTIONS:
- You are operating without specific document context
- Provide general legal guidance while emphasizing the need for document review
- Recommend that the user upload relevant documents for more specific analysis
- Maintain professional legal language and terminology
- Always recommend consulting with qualified legal counsel for specific legal matters

`}IMPORTANT DISCLAIMERS:
- This analysis is for informational purposes only and does not constitute legal advice
- Always consult with qualified legal counsel for specific legal matters
- Verify all information against original source documents
- Consider jurisdiction-specific laws and regulations

Please provide a thorough, professional response to the user's query.`;

    // Stream the AI response
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
      temperature: 0.1,
      maxTokens: 2000,
      onFinish: async (result) => {
        // Save the conversation to database
        try {
          // Create or get conversation
          let conversationId;
          
          // For now, we'll create a new conversation for each chat
          // In a full implementation, you'd manage conversation persistence
          const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .insert({
              user_id: user.id,
              title: userQuery.substring(0, 100) + '...',
            })
            .select()
            .single();

          if (conversation && !convError) {
            conversationId = conversation.id;

            // Save user message
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              role: 'user',
              content: userQuery,
            });

            // Save assistant message
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: result.text,
            });
          }
        } catch (saveError) {
          console.error('Error saving conversation:', saveError);
        }
      },
    });

    return result.toAIStreamResponse({
      headers: {
        'X-Sources': JSON.stringify(sources),
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}