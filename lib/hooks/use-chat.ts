import { useState, useCallback, useRef } from 'react';
import { Message } from '@/lib/types/database';
import { sendChatMessage, saveChatSession, ChatResponse } from '@/lib/actions/chat-actions';

export interface UseChatOptions {
  initialMessages?: Message[];
  autoSave?: boolean;
  onError?: (error: string) => void;
  onResponse?: (response: ChatResponse) => void;
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
  sendMessage: (content: string, documentIds?: string[]) => Promise<void>;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  clearError: () => void;
  retryLastMessage: () => Promise<void>;
  sessionId: string | null;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    initialMessages = [],
    autoSave = false,
    onError,
    onResponse,
  } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Store the last request for retry functionality
  const lastRequestRef = useRef<{
    content: string;
    documentIds: string[];
  } | null>(null);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setSessionId(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(async (
    content: string, 
    documentIds: string[] = []
  ): Promise<void> => {
    if (!content.trim() || isLoading) return;

    // Store for retry functionality
    lastRequestRef.current = { content, documentIds };

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      created_at: new Date().toISOString(),
      conversation_id: '',
      sources: [], // Initially empty, will be filled by the response
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      // Prepare messages for API (including the new user message)
      const currentMessages = [...messages, userMessage];
      
      // Send to server action
      const response = await sendChatMessage(currentMessages, documentIds);
      
      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: 'assistant',
        created_at: new Date().toISOString(),
        sources: response.sources,
      };

      // Add assistant message
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-save if enabled
      if (autoSave) {
        try {
          const saveResult = await saveChatSession([...currentMessages, assistantMessage], sessionId || undefined);
          setSessionId(saveResult.sessionId);
        } catch (saveError) {
          console.warn('Failed to auto-save chat session:', saveError);
        }
      }

      // Call success callback
      onResponse?.(response);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      onError?.(errorMessage);

      // Remove the user message on error (optional)
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [messages, isLoading, sessionId, autoSave, onError, onResponse]);

  const retryLastMessage = useCallback(async (): Promise<void> => {
    if (!lastRequestRef.current) return;
    
    const { content, documentIds } = lastRequestRef.current;
    await sendMessage(content, documentIds);
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    error,
    isTyping,
    sendMessage,
    addMessage,
    clearMessages,
    clearError,
    retryLastMessage,
    sessionId,
  };
}