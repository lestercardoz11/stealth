'use server';

import { Message, Source } from '@/lib/types/database';
import { createClient } from '@/lib/utils/supabase/server';
import { generateChatResponse } from '@/lib/ai/ollama-client';
import { mentionsAttachment, enhanceContextForAttachments } from '@/lib/ai/prompts';
import { searchDocuments } from '@/lib/ai/document-processor';
import { auditLogger, AUDIT_ACTIONS } from '@/lib/security/audit-logger';

export interface ChatResponse {
  response: string;
  sources: Source[];
}

export async function sendChatMessage(
  messages: Message[], 
  documentIds: string[]
): Promise<ChatResponse> {
  try {
    console.log('Processing chat message with', documentIds.length, 'documents');
    
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

    // Check if user mentions attachments or similar terms
    const userMentionsAttachment = mentionsAttachment(userQuery);

    let context = '';
    let sources: Source[] = [];

    // If we have document IDs, search for relevant chunks and get full document content
    if (documentIds && documentIds.length > 0) {
      try {
        console.log('Searching for relevant document chunks...');
        
        // First, get the full document content for the selected documents
        const { data: selectedDocuments, error: docError } = await supabase
          .from('documents')
          .select('id, title, content')
          .in('id', documentIds);

        if (docError) {
          console.error('Error fetching selected documents:', docError);
        } else if (selectedDocuments && selectedDocuments.length > 0) {
          console.log(`Found ${selectedDocuments.length} selected documents`);
          
          // Use full document content as context
          context = selectedDocuments
            .map((doc) => `Document: ${doc.title}\n\nContent:\n${doc.content || 'No content available'}`)
            .join('\n\n---\n\n');
          
          // Also search for relevant chunks for better source attribution
          const relevantChunks = await searchDocuments(
            userQuery,
            documentIds,
            0.3, // Lower threshold for better recall
            5
          );

          if (relevantChunks && relevantChunks.length > 0) {
            sources = relevantChunks.map((chunk) => ({
              documentId: chunk.document_id,
              documentTitle: chunk.document_title,
              similarity: chunk.similarity,
              content: chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''),
            }));
            
            console.log(`Found ${relevantChunks.length} relevant chunks for source attribution`);
          } else {
            // If no chunks found, create sources from full documents
            sources = selectedDocuments.map((doc) => ({
              documentId: doc.id,
              documentTitle: doc.title,
              similarity: 0.9, // High similarity since user explicitly selected
              content: (doc.content || '').substring(0, 200) + ((doc.content || '').length > 200 ? '...' : ''),
            }));
          }
          
          console.log(`Using context from ${selectedDocuments.length} selected documents`);
        }
      } catch (searchError) {
        console.error('Document search error:', searchError);
        // Continue without context if search fails
        context = '';
        sources = [];
      }
    }

    // Enhance context message if user mentions attachments
    if (userMentionsAttachment && context) {
      context = enhanceContextForAttachments(context);
    }
    console.log('Final context length:', context.length);
    console.log('Number of sources:', sources.length);

    console.log('Generating AI response with context length:', context.length);
    console.log('Context preview:', context.substring(0, 500) + (context.length > 500 ? '...' : ''));
    
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
      resource: 'Chat API',
      details: `Processed AI query with ${documentIds?.length || 0} documents`,
      severity: 'low',
      metadata: {
        documentCount: documentIds?.length || 0,
        queryLength: userQuery.length,
        responseLength: response.length,
        hasContext: context.length > 0
      }
    });

    console.log('Chat response generated successfully');
    
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

export async function saveChatSession(
  messages: Message[],
  sessionId?: string
): Promise<{ sessionId: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create or update conversation
    if (sessionId) {
      return { sessionId };
    } else {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: messages[0]?.content.substring(0, 50) + '...' || 'New Conversation',
        })
        .select()
        .single();

      if (error) throw error;
      
      return { sessionId: conversation.id };
    }
  } catch (error) {
    console.error('Error saving chat session:', error);
    return { sessionId: sessionId || crypto.randomUUID() };
  }
}

export async function generateConversationTitle(
  conversationId: string,
  messages: Message[]
): Promise<string> {
  try {
    const response = await fetch('/api/chat/generate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        messages: messages.slice(0, 6), // Only use first 3 exchanges
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate title');
    }

    const data = await response.json();
    return data.title || 'New Conversation';
  } catch (error) {
    console.error('Error generating conversation title:', error);
    return 'New Conversation';
  }
}