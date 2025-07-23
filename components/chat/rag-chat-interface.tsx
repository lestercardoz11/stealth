'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import { DocumentSelector } from './document-selector';
import { ContextPanel } from './context-panel';
import { Send, FileText, Brain, Loader2, AlertCircle } from 'lucide-react';

interface RAGChatInterfaceProps {
  availableDocuments: any[];
  onSendMessage: (messages: any[], documentIds: string[]) => Promise<{ response: string; sources: any[] }>;
}

export function RAGChatInterface({ availableDocuments, onSendMessage }: RAGChatInterfaceProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const data = await onSendMessage(
        [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content,
        })),
        selectedDocuments
      );
      
      setSources(data.sources || []);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.response,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='flex h-full bg-gray-50/50 dark:bg-gray-900/50'>
      {/* Document Selector Sidebar */}
      <div className='w-80 border-r bg-background'>
        <div className='p-4 border-b'>
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
        {/* Messages Area */}
        <ScrollArea className='flex-1 p-4'>
          <div className='space-y-4 max-w-4xl mx-auto'>
            {messages.length === 0 && (
              <div className='text-center py-8'>
                <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                  <Brain className='h-8 w-8 text-white' />
                </div>
                <h3 className='text-lg font-semibold mb-2'>
                  Welcome to Stealth AI
                </h3>
                <p className='text-muted-foreground mb-4'>
                  Your intelligent legal document assistant. Select documents
                  from the sidebar and start asking questions.
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto'>
                  <Card className='p-3 hover:bg-accent/50 transition-colors cursor-pointer'>
                    <p className='text-sm font-medium'>
                      Analyze contract terms
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Review key clauses and obligations
                    </p>
                  </Card>
                  <Card className='p-3 hover:bg-accent/50 transition-colors cursor-pointer'>
                    <p className='text-sm font-medium'>Summarize documents</p>
                    <p className='text-xs text-muted-foreground'>
                      Get concise overviews of lengthy documents
                    </p>
                  </Card>
                  <Card className='p-3 hover:bg-accent/50 transition-colors cursor-pointer'>
                    <p className='text-sm font-medium'>
                      Find specific information
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Search across multiple documents
                    </p>
                  </Card>
                  <Card className='p-3 hover:bg-accent/50 transition-colors cursor-pointer'>
                    <p className='text-sm font-medium'>Legal research</p>
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
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='text-sm'>Stealth AI is thinking...</span>
              </div>
            )}

            {error && (
              <div className='flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg'>
                <AlertCircle className='h-4 w-4' />
                <span className='text-sm'>Error: {error}</span>
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
                className='flex-1'
              />
              <Button
                type='submit'
                disabled={isLoading || !input.trim()}
                size='icon'>
                {isLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Send className='h-4 w-4' />
                )}
              </Button>
            </div>

            {selectedDocuments.length === 0 && (
              <p className='text-xs text-muted-foreground mt-2 text-center'>
                💡 Tip: Select documents from the sidebar to enable
                context-aware responses
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Context Panel (optional, can be toggled) */}
      {sources.length > 0 && <ContextPanel sources={sources} />}
    </div>
  );
}
