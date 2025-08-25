'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, Conversation } from '@/lib/types/database';
import { createClient } from '@/lib/utils/supabase/client';

export interface UseChatOptions {
  initialMessages?: Message[];
  conversationId?: string;
  autoSave?: boolean;
  onError?: (error: string) => void;
  onResponse?: (response: { response: string; sources: any[] }) => void;
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
    autoSave = true,
    onError,
    onResponse,
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
      const supabase = createClient();
      let conversationToUse = currentConversation;

      // Create new conversation if none exists
      if (!conversationToUse) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          })
          .select()
          .single();

        if (convError) throw convError;
        
        conversationToUse = newConversation;
        setCurrentConversation(newConversation);
        setConversations(prev => [newConversation, ...prev]);
      }

      // Save user message to database
      const { error: userMsgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationToUse.id,
          role: 'user',
          content: content.trim(),
        });

      if (userMsgError) throw userMsgError;

      // Send to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [userMessage],
          documentIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Chat API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        created_at: new Date().toISOString(),
        conversation_id: conversationToUse.id,
        sources: data.sources || [],
      };

      // Save assistant message to database
      const { error: assistantMsgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationToUse.id,
          role: 'assistant',
          content: data.response,
        });

      if (assistantMsgError) throw assistantMsgError;

      // Add assistant message to UI
      setMessages(prev => [...prev, assistantMessage]);

      // Call success callback
      onResponse?.(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      onError?.(errorMessage);

      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, isLoading, onError, onResponse]);

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