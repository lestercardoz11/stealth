'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import { DocumentSelector } from './document-selector';
import { ContextPanel } from './context-panel';
import { PrivacyBadge } from '@/components/security/privacy-badge';
import { Send, FileText, Brain, Loader2, AlertCircle } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RetryButton } from '@/components/ui/retry-button';
import { sendChatMessage } from '@/lib/actions/chat-actions';
import { Message } from '@/lib/types/database';

interface Document {
  id: string;
  title: string;
  created_at: string;
  is_company_wide: boolean;
  user_id: string;
}

interface RAGChatInterfaceProps {
  availableDocuments: Document[];
}

interface Source {
  documentId: string;
  documentTitle: string;
  similarity: number;
  content: string;
}

export function RAGChatInterface({
  availableDocuments,
}: RAGChatInterfaceProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    console.log('Submitting chat message:', input);
    console.log('Selected documents:', selectedDocuments);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      created_at: new Date().toISOString(),
      conversation_id: '', // This will be set by the server
      sources: [], // Initially empty, will be filled by the response
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setLastQuery(input);

    try {
      const data = await sendChatMessage(
        [...messages, userMessage],
        selectedDocuments
      );

      console.log('Chat response received:', data);

      setSources(data.sources || []);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.response,
        created_at: new Date().toISOString(),
        conversation_id: '', // This will be set by the server
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (lastQuery) {
      setInput(lastQuery);
      await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ErrorBoundary>
      <div className='flex bg-gray-50/50 dark:bg-gray-900/50'>
        {/* Document Selector Sidebar */}
        <div className='hidden lg:block w-80 border-r bg-background'>
          <div className='p-4 border-b'>
            <div className='mb-3'>
              <PrivacyBadge variant='compact' />
            </div>
            <h3 className='font-semibold flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Document Context
            </h3>
            <p className='text-sm text-muted-foreground mt-1'>
              Select documents to provide context for your AI assistant
            </p>
          </div>

          <ScrollArea className='h-[calc(100vh-200px)]'>
            <div className='p-4'>
              <DocumentSelector
                documents={availableDocuments}
                selected={selectedDocuments}
                onSelect={setSelectedDocuments}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Interface */}
        <div className='flex-1 flex flex-col'>
          {/* Mobile Document Selector */}
          <div className='lg:hidden border-b bg-background p-4'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-medium text-sm'>Selected Documents</h3>
              <PrivacyBadge variant='compact' />
            </div>
            <p className='text-xs text-muted-foreground'>
              {selectedDocuments.length} document
              {selectedDocuments.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Messages Area */}
          <ScrollArea className='flex-1 p-2 md:p-4'>
            <div className='space-y-4 max-w-4xl mx-auto'>
              {messages.length === 0 && (
                <div className='text-center py-4 md:py-8'>
                  <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                    <Brain className='h-8 w-8 text-white' />
                  </div>
                  <h3 className='text-lg md:text-xl font-semibold mb-2'>
                    Welcome to Stealth AI
                  </h3>
                  <p className='text-muted-foreground mb-4 text-sm md:text-base px-4'>
                    Your intelligent legal document assistant.
                    <span className='hidden lg:inline'>
                      Select documents from the sidebar and
                    </span>
                    <span className='lg:hidden'>Select documents and</span>{' '}
                    start asking questions.
                  </p>
                  <div className='mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-md mx-auto'>
                    <p className='text-xs text-blue-700 dark:text-blue-200'>
                      💡 <strong>RAG-Powered:</strong> The AI will search through your selected documents to provide contextual, accurate responses with source citations.
                    </p>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-w-2xl mx-auto px-4'>
                    <Card className='p-3 hover:bg-accent/50 transition-colors cursor-pointer'>
                      <p className='text-xs md:text-sm font-medium'>
                        Analyze contract terms
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Review key clauses and obligations
                      </p>
                    </Card>
                    <Card className='p-3 hover:bg-accent/50 transition-colors cursor-pointer'>
                      <p className='text-xs md:text-sm font-medium'>
                        Summarize documents
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Get concise overviews of lengthy documents
                      </p>
                    </Card>
                    <Card className='p-3 hover:bg-accent/50 transition-colors cursor-pointer'>
                      <p className='text-xs md:text-sm font-medium'>
                        Find specific information
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Search across multiple documents
                      </p>
                    </Card>
                    <Card className='p-3 hover:bg-accent/50 transition-colors cursor-pointer'>
                      <p className='text-xs md:text-sm font-medium'>
                        Legal research
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Get insights on legal precedents
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  sources={message.role === 'assistant' ? sources : []}
                />
              ))}

              {isLoading && (
                <div className='flex justify-center'>
                  <div className='flex flex-col items-center gap-2'>
                    <LoadingSpinner text='Stealth AI is analyzing documents...' />
                    <p className='text-xs text-muted-foreground'>
                      Searching through {selectedDocuments.length} selected document{selectedDocuments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className='flex flex-col items-center gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg'>
                  <div className='flex items-center gap-2'>
                    <AlertCircle className='h-4 w-4' />
                    <span className='text-sm'>Error: {error}</span>
                  </div>
                  <RetryButton onRetry={handleRetry} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className='border-t bg-background p-4'>
            <form onSubmit={handleSubmit} className='max-w-4xl mx-auto'>
              <div className='flex gap-2'>
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={
                    selectedDocuments.length > 0
                      ? 'Ask about your selected documents...'
                      : 'Select documents first, then ask questions...'
                  }
                  disabled={isLoading}
                  className='flex-1 text-sm md:text-base'
                />
                <Button
                  type='submit'
                  disabled={isLoading || !input.trim()}
                  size='icon'
                  className='shrink-0'>
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Send className='h-4 w-4' />
                  )}
                </Button>
              </div>

              {selectedDocuments.length === 0 && (
                <p className='text-xs text-muted-foreground mt-2 text-center'>
                  💡 Tip: Select documents from the sidebar to enable RAG-powered, context-aware responses with source citations
                </p>
              )}
              
              {selectedDocuments.length > 0 && (
                <p className='text-xs text-green-600 dark:text-green-400 mt-2 text-center'>
                  🔍 RAG Mode: AI will search through {selectedDocuments.length} selected document{selectedDocuments.length !== 1 ? 's' : ''} for relevant context
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Context Panel (optional, can be toggled) */}
        {sources.length > 0 && (
          <div className='hidden xl:block'>
            <ContextPanel sources={sources} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
