'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './message-bubble';
import { ContextPanel } from './context-panel';
import { ConversationList } from './conversation-list';
import { DocumentSelectorModal } from './document-selector-modal';
import { PrivacyBadge } from '@/components/security/privacy-badge';
import { StreamingMessage } from './streaming-message';
import {
  Send,
  FileText,
  Brain,
  AlertCircle,
  MessageSquare,
  Loader2,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { RetryButton } from '@/components/ui/retry-button';
import { useChat } from '@/lib/hooks/use-chat';

interface Document {
  id: string;
  title: string;
  created_at: string;
  is_company_wide: boolean;
  user_id: string;
  file_size?: number;
  file_type?: string;
}

interface RAGChatInterfaceProps {
  availableDocuments: Document[];
}

export function RAGChatInterface({
  availableDocuments,
}: RAGChatInterfaceProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showConversations, setShowConversations] = useState(true);
  const [input, setInput] = useState('');
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

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
      setIsStreaming(false);
      setStreamingResponse('');
    },
    onResponse: (response) => {
      console.log('Chat response received:', response);
      setIsStreaming(false);
      setStreamingResponse('');
    },
    onProcessingStage: (stage) => {
      if (stage) {
        setIsStreaming(true);
        setStreamingResponse(stage);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');
    setIsStreaming(true);
    setStreamingResponse('Analyzing your query...');

    // Simulate streaming effect
    const stages = [
      'Analyzing your query...',
      'Searching through documents...',
      'Finding relevant context...',
      'Generating AI response...',
    ];

    let stageIndex = 0;
    const stageInterval = setInterval(() => {
      if (stageIndex < stages.length - 1) {
        stageIndex++;
        setStreamingResponse(stages[stageIndex]);
      }
    }, 1000);

    try {
      await sendMessage(messageContent, selectedDocuments);
    } finally {
      clearInterval(stageInterval);
      setIsStreaming(false);
      setStreamingResponse('');
    }
  };

  const getSelectedDocumentTitles = () => {
    return availableDocuments
      .filter((doc) => selectedDocuments.includes(doc.id))
      .map((doc) => doc.title);
  };

  // Get sources from the last assistant message
  const lastAssistantMessage = messages
    .slice()
    .reverse()
    .find((m) => m.role === 'assistant');
  const sources = lastAssistantMessage?.sources || [];

  return (
    <ErrorBoundary>
      <div className='flex h-screen bg-gradient-soft'>
        {/* Conversations Sidebar */}
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

        {/* Main Chat Interface */}
        <div className='flex-1 flex flex-col min-w-0'>
          {/* Mobile Controls */}
          <div className='lg:hidden border-b bg-card/80 backdrop-blur p-2'>
            <div className='flex items-center justify-between'>
              <Button
                variant={showConversations ? 'default' : 'outline'}
                size='sm'
                className='h-6 text-xs px-2'
                onClick={() => setShowConversations(!showConversations)}>
                <MessageSquare className='h-3 w-3 mr-1' />
                Chats ({conversations.length})
              </Button>
              <PrivacyBadge variant='compact' />
            </div>
          </div>

          {/* Mobile Conversations */}
          {showConversations && (
            <div className='lg:hidden border-b bg-card/95'>
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

          {currentConversation && (
            <div className='p-3 md:p-4 max-w-4xl'>
              <div className='flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-foreground flex items-center gap-2'>
                  <MessageSquare className='h-4 w-4' />
                  {currentConversation?.title}
                </h2>
              </div>
            </div>
          )}
          {/* Messages Area */}
          <ScrollArea className='flex-1 p-3 md:p-4'>
            <div className='space-y-1 max-w-4xl mx-auto'>
              {messages.length === 0 && (
                <div className='text-center py-6 md:py-8'>
                  <div className='w-10 h-10 bg-gradient-to-r from-primary/80 to-primary rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <Brain className='h-5 w-5 text-primary-foreground' />
                  </div>
                  <h3 className='text-sm md:text-base font-semibold mb-2 text-foreground/90'>
                    Welcome to Stealth AI
                  </h3>
                  <p className='text-muted-foreground mb-4 text-xs px-4 leading-relaxed'>
                    Your intelligent legal document assistant. Select documents
                    and start asking questions.
                  </p>

                  <div className='mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20 max-w-md mx-auto'>
                    <p className='text-xs text-primary/80'>
                      💡 <strong>RAG-Powered:</strong> The AI searches through
                      your documents to provide contextual responses with
                      citations.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Streaming Message */}
              {isStreaming && (
                <StreamingMessage
                  content={streamingResponse}
                  selectedDocumentCount={selectedDocuments.length}
                />
              )}

              {error && (
                <div className='flex flex-col items-center gap-2 text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/20'>
                  <div className='flex items-center gap-2'>
                    <AlertCircle className='h-3 w-3' />
                    <span className='text-xs'>Error: {error}</span>
                  </div>
                  <div className='flex gap-2'>
                    <RetryButton
                      onRetry={retryLastMessage}
                      size='sm'
                      className='h-6 text-xs'
                    />
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={clearError}
                      className='h-6 text-xs'>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className='border-t bg-card/80 backdrop-blur p-3'>
            <div className='max-w-4xl mx-auto space-y-2'>
              {/* Selected Documents Display */}
              {selectedDocuments.length > 0 && (
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className='text-xs text-muted-foreground'>
                    📄 Selected Documents ({selectedDocuments.length}):
                  </span>
                  {getSelectedDocumentTitles()
                    .slice(0, 3)
                    .map((title, index) => (
                      <Badge
                        key={index}
                        variant='outline'
                        className='text-xs px-2 py-1 bg-primary/10 border-primary/30'>
                        {title.length > 20
                          ? title.substring(0, 20) + '...'
                          : title}
                      </Badge>
                    ))}
                  {selectedDocuments.length > 3 && (
                    <Badge variant='outline' className='text-xs px-2 py-1 bg-primary/10 border-primary/30'>
                      +{selectedDocuments.length - 3} more
                    </Badge>
                  )}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-5 w-5 p-0'
                    onClick={() => setSelectedDocuments([])}>
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmit} className='flex gap-2'>
                <DocumentSelectorModal
                  documents={availableDocuments}
                  selectedDocuments={selectedDocuments}
                  onSelectionChange={setSelectedDocuments}>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-8 px-2 shrink-0'>
                    <FileText className='h-3 w-3 mr-1' />
                    {selectedDocuments.length > 0
                      ? selectedDocuments.length
                      : 'Docs'}
                  </Button>
                </DocumentSelectorModal>

                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    selectedDocuments.length > 0
                      ? 'Ask about your selected documents...'
                      : 'Ask a question or select documents for context...'
                  }
                  disabled={isLoading || isStreaming}
                  className='flex-1 h-8 text-xs'
                />

                <Button
                  type='submit'
                  disabled={isLoading || isStreaming || !input.trim()}
                  size='sm'
                  className='h-8 px-3 shrink-0'>
                  {isLoading || isStreaming ? (
                    <Loader2 className='h-3 w-3 animate-spin' />
                  ) : (
                    <Send className='h-3 w-3' />
                  )}
                </Button>
              </form>

              {/* Context Indicator */}
              {selectedDocuments.length === 0 ? (
                <p className='text-xs text-muted-foreground text-center'>
                  💡 Click "Select Documents" to choose files for AI analysis with source citations
                </p>
              ) : (
                <p className='text-xs text-primary/80 text-center'>
                  🔍 AI will analyze {selectedDocuments.length} selected document{selectedDocuments.length !== 1 ? 's' : ''} to answer your questions
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Context Panel */}
        {sources.length > 0 && window.innerWidth >= 1280 && (
          <div className='hidden xl:block'>
            <ContextPanel sources={sources} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
