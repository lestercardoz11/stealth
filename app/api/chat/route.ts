import { generateChatResponse } from '@/lib/ai/ollama-client';
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

    // Generate response using Ollama
    const response = await generateChatResponse(messages, context);

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
    return new Response('Internal server error', { status: 500 });
  }
}