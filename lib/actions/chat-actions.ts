'use server';

import { Message } from '@/lib/types/database';

interface Source {
  documentId: string;
  documentTitle: string;
  similarity: number;
  content: string;
}

export interface ChatResponse {
  response: string;
  sources: Source[];
}

export async function sendChatMessage(
  messages: Message[], 
  documentIds: string[]
): Promise<ChatResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          documentIds,
        }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chat API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract sources from response headers or body
    const sourcesHeader = response.headers.get('X-Sources');
    let sources = [];
    
    if (sourcesHeader) {
      try {
        sources = JSON.parse(sourcesHeader);
      } catch (e) {
        console.error('Error parsing sources from header:', e);
      }
    }

    return {
      response: data.response,
      sources: data.sources || sources,
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
  // Implementation for saving chat sessions
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          sessionId,
        }),
    });

    if (!response.ok) {
      throw new Error('Failed to save chat session');
    }

    const data = await response.json();
    return { sessionId: data.sessionId };
  } catch (error) {
    console.error('Save session error:', error);
    throw new Error('Failed to save chat session');
  }
}