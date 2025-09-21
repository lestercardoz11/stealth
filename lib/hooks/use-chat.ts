'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, Conversation } from '@/lib/types/database';
import { createClient } from '@/lib/utils/supabase/client';
import { sendChatMessage } from '@/lib/actions/chat-actions';

export interface UseChatOptions {
  initialMessages?: Message[];
  conversationId?: string;
  autoSave?: boolean;
  onError?: (error: string) => void;
  onResponse?: (response: { response: string; sources: any[] }) => void;
  onProcessingStage?: (stage: string) => void;
}

export interface UseChatReturn {
  messages: Message[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, documentIds?: string[]) => Promise<void>;
  createNewConversation: () => void;
  selectConversation: (conversation: Conversation) => void;
  deleteConversation: (conversationId: string) => void;
  clearError: () => void;
  retryLastMessage: () => Promise<void>;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    initialMessages = [],
    conversationId,
    onError,
    onResponse,
    onProcessingStage,
  } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store the last request for retry functionality
  const lastRequestRef = useRef<{
    content: string;
    documentIds: string[];
  } | null>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  const loadConversations = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setConversations(data || []);
      
      // If we have a conversationId prop, select that conversation
      if (conversationId && data) {
        const conversation = data.find(c => c.id === conversationId);
        if (conversation) {
          setCurrentConversation(conversation);
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform database messages to include sources
      const transformedMessages = (data || []).map(msg => ({
        ...msg,
        sources: [] // Sources will be populated from the response
      }));
      
      setMessages(transformedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    }
  };

  const createNewConversation = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  }, []);

  const selectConversation = useCallback((conversation: Conversation) => {
    setCurrentConversation(conversation);
    setError(null);
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      // Update local state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // If this was the current conversation, clear it
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
    }
  }, [currentConversation]);

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
      conversation_id: currentConversation?.id || '',
      sources: [],
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Processing stages for better UX
      onProcessingStage?.('Analyzing query...');
      
      // Add delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (documentIds.length > 0) {
        onProcessingStage?.('Searching documents...');
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Use server action for chat processing
      const result = await sendChatMessage(messages.concat(userMessage), documentIds);
      
      onProcessingStage?.('Generating response...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.response,
        role: 'assistant',
        created_at: new Date().toISOString(),
        conversation_id: currentConversation?.id || '',
        sources: result.sources || [],
      };

      // Add assistant message to UI
      setMessages(prev => [...prev, assistantMessage]);

      // Call success callback
      onResponse?.(result);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      onError?.(errorMessage);

      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      onProcessingStage?.('');
    }
  }, [currentConversation, isLoading, onError, onResponse, onProcessingStage, messages]);

  const retryLastMessage = useCallback(async (): Promise<void> => {
    if (!lastRequestRef.current) return;
    
    const { content, documentIds } = lastRequestRef.current;
    await sendMessage(content, documentIds);
  }, [sendMessage]);

  return {
    messages,
    conversations,
    currentConversation,
    isLoading,
    error,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    clearError,
    retryLastMessage,
  };
}