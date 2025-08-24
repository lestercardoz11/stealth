'use server';

import { Message, Source } from '@/lib/types/database';
import { createClient } from '@/lib/utils/supabase/server';
import { generateChatResponse } from '@/lib/ai/ollama-client';
import { searchDocuments } from '@/lib/ai/document-processor';

export interface ChatResponse {
  response: string;
  sources: Source[];
}

export async function sendChatMessage(
  messages: Message[], 
  documentIds: string[]
): Promise<ChatResponse> {
  try {
    // Get the user's query (last message)
    const userQuery = messages[messages.length - 1]?.content;
    
    if (!userQuery) {
      throw new Error('No query provided');
    }

    // Check if user is authenticated and approved
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check user profile and status
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role, email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'approved') {
      throw new Error('Account not approved');
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
        // Search for relevant document chunks
        const relevantChunks = await searchDocuments(
          userQuery,
          documentIds,
          0.7,
          5
        );

        if (relevantChunks && relevantChunks.length > 0) {
          context = relevantChunks
            .map((chunk) => `Document: ${chunk.document_title}\nContent: ${chunk.content}`)
            .join('\n\n---\n\n');
          
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

    return {
      response,
      sources,
    };
  } catch (error) {
    console.error('Chat message error:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to send chat message'
    );
  }
}

// Additional server actions you might need
export async function saveChatSession(
  messages: Message[],
  sessionId?: string
): Promise<{ sessionId: string }> {
  // For now, return a mock session ID
  // In a real implementation, this would save to the database
  return { sessionId: sessionId || crypto.randomUUID() };
}