'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import { DocumentSelector } from './document-selector';
import { ContextPanel } from './context-panel';
import { ConversationList } from './conversation-list';
import { PrivacyBadge } from '@/components/security/privacy-badge';
import { Send, FileText, Brain, AlertCircle, MessageSquare, Loader2, Zap } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RetryButton } from '@/components/ui/retry-button';
import { useChat } from '@/lib/hooks/use-chat';
import { Card } from '@/components/ui/card';

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

export function RAGChatInterface({
  availableDocuments,
}: RAGChatInterfaceProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showConversations, setShowConversations] = useState(true);
  const [showDocuments, setShowDocuments] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');

  const {
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
  } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
      setProcessingStage('');
    },
    onResponse: (response) => {
      console.log('Chat response received:', response);
      setProcessingStage('');
    },
  });

  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');
    setProcessingStage('Analyzing query...');

    await sendMessage(messageContent, selectedDocuments);
  };

  // Get sources from the last assistant message
  const lastAssistantMessage = messages
    .slice()
    .reverse()
    .find((m) => m.role === 'assistant');
  const sources = lastAssistantMessage?.sources || [];

  // Enhanced loading component with stages
  const LoadingIndicator = () => (
    <div className='flex flex-col items-center gap-3 p-6'>
      <div className='flex items-center gap-3'>
        <div className='relative'>
          <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
          <div className='absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse' />
        </div>
        <div className='text-left'>
          <p className='font-medium text-blue-700'>Stealth AI Processing</p>
          <p className='text-sm text-blue-600'>
            {processingStage || 'Generating response...'}
          </p>
        </div>
      </div>
      
      {selectedDocuments.length > 0 && (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Zap className='h-3 w-3' />
          <span>
            Searching through {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      
      <div className='flex items-center gap-1 text-xs text-green-600'>
        <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
        <span>100% Private Processing</span>
      </div>
    </div>
  );
  return (
    <ErrorBoundary>
      <div className='flex h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-gray-900/50'>
        {/* Conversations Sidebar - Desktop */}
        {showConversations && (
          <div className='hidden lg:block'>
            <ConversationList
              conversations={conversations}
              selectedConversationId={currentConversation?.id}
              onSelectConversation={selectConversation}
              onNewConversation={createNewConversation}
              onDeleteConversation={deleteConversation}
            />
          </div>
        )}

        {/* Document Selector Sidebar - Desktop */}
        {showDocuments && (
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
        )}

        {/* Main Chat Interface */}
        <div className='flex-1 flex flex-col'>
          {/* Mobile Controls */}
          <div className='lg:hidden border-b bg-background p-3'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex gap-2'>
                <Button
                  variant={showConversations ? 'default' : 'outline'}
                  size='sm'
                  className='h-7 text-xs'
                  onClick={() => {
                    setShowConversations(!showConversations);
                    setShowDocuments(false);
                  }}
                >
                  <MessageSquare className='h-3 w-3 mr-1' />
                  Chats
                </Button>
                <Button
                  variant={showDocuments ? 'default' : 'outline'}
                  size='sm'
                  className='h-7 text-xs'
                  onClick={() => {
                    setShowDocuments(!showDocuments);
                    setShowConversations(false);
                  }}
                >
                  <FileText className='h-3 w-3 mr-1' />
                  Docs
                </Button>
              </div>
              <PrivacyBadge variant='compact' />
            </div>
            
            {showDocuments && (
              <p className='text-xs text-muted-foreground/80'>
                {selectedDocuments.length} document
                {selectedDocuments.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Mobile Sidebars */}
          {showConversations && (
            <div className='lg:hidden border-b bg-background/95'>
              <ConversationList
                conversations={conversations}
                selectedConversationId={currentConversation?.id}
                onSelectConversation={(conv) => {
                  selectConversation(conv);
                  setShowConversations(false);
                }}
                onNewConversation={() => {
                  createNewConversation();
                  setShowConversations(false);
                }}
                onDeleteConversation={deleteConversation}
              />
            </div>
          )}

          {showDocuments && (
            <div className='lg:hidden border-b bg-background p-3'>
              <DocumentSelector
                documents={availableDocuments}
                selected={selectedDocuments}
                onSelect={(docs) => {
                  setSelectedDocuments(docs);
                  setShowDocuments(false);
                }}
              />
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className='flex-1 p-3 md:p-4'>
            <div className='space-y-3 max-w-3xl mx-auto'>
              {messages.length === 0 && (
                <div className='text-center py-6 md:py-8'>
                  <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <Brain className='h-6 w-6 text-white' />
                  </div>
                  <h3 className='text-base md:text-lg font-semibold mb-2'>
                    {currentConversation ? 'Continue Your Conversation' : 'Welcome to Stealth AI'}
                  </h3>
                  <p className='text-muted-foreground mb-3 text-sm px-4 leading-relaxed'>
                    Your intelligent legal document assistant.
                    <span className='hidden lg:inline'>
                      Select documents from the sidebar and
                    </span>
                    <span className='lg:hidden'>Select documents and</span>{' '}
                    start asking questions.
                  </p>
                  <div className='mb-3 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800 max-w-md mx-auto'>
                    <p className='text-xs text-blue-700 dark:text-blue-200'>
                      💡 <strong>RAG-Powered:</strong> The AI will search
                      through your selected documents to provide contextual,
                      accurate responses with source citations.
                    </p>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-w-2xl mx-auto px-4'>
                    <Card className='p-2 hover:bg-accent/30 transition-colors cursor-pointer border-0 bg-muted/30'>
                      <p className='text-xs font-medium'>
                        Analyze contract terms
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Review key clauses and obligations
                      </p>
                    </Card>
                    <Card className='p-2 hover:bg-accent/30 transition-colors cursor-pointer border-0 bg-muted/30'>
                      <p className='text-xs font-medium'>
                        Summarize documents
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Get concise overviews of lengthy documents
                      </p>
                    </Card>
                    <Card className='p-2 hover:bg-accent/30 transition-colors cursor-pointer border-0 bg-muted/30'>
                      <p className='text-xs font-medium'>
                        Find specific information
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Search across multiple documents
                      </p>
                    </Card>
                    <Card className='p-2 hover:bg-accent/30 transition-colors cursor-pointer border-0 bg-muted/30'>
                      <p className='text-xs font-medium'>
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
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className='flex justify-center'>
                  <div className='flex flex-col items-center gap-2'>
                    <LoadingSpinner size='md' text='Stealth AI is analyzing documents...' />
                    <p className='text-xs text-muted-foreground'>
                      Searching through {selectedDocuments.length} selected
                      document{selectedDocuments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className='flex flex-col items-center gap-2 text-red-600 bg-red-50/50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900'>
                  <div className='flex items-center gap-2'>
                    <AlertCircle className='h-3 w-3' />
                    <span className='text-sm'>Error: {error}</span>
                  </div>
                  <RetryButton onRetry={retryLastMessage} />
                  <Button variant='ghost' size='sm' onClick={clearError}>
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className='border-t bg-background/95 backdrop-blur p-3'>
            <form onSubmit={handleSubmit} className='max-w-3xl mx-auto'>
              <div className='flex gap-2'>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    selectedDocuments.length > 0
                      ? 'Ask about your selected documents...'
                      : 'Ask a question or select documents for context...'
                  }
                  disabled={isLoading}
                  className='flex-1 text-sm md:text-base'
                  style={{ fontSize: '14px' }}
                />
                <Button
                  type='submit'
                  disabled={isLoading || !input.trim()}
                  size='icon'
                  className='shrink-0'>
                  <Send className='h-4 w-4' />
                </Button>
              </div>

              {selectedDocuments.length === 0 && (
                <p className='text-xs text-muted-foreground mt-2 text-center'>
                  💡 Select documents for RAG-powered responses with source citations
                </p>
              )}

              {selectedDocuments.length > 0 && (
                <p className='text-xs text-green-600 dark:text-green-400 mt-1 text-center'>
                  🔍 RAG Mode: AI will search through {selectedDocuments.length}{' '}
                  selected document{selectedDocuments.length !== 1 ? 's' : ''}{' '}
                  for relevant context
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Context Panel (optional, can be toggled) */}
        {sources.length > 0 && window.innerWidth >= 1280 && (
          <div className='hidden xl:block'>
            <ContextPanel sources={sources} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}