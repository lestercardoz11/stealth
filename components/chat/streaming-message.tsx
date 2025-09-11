'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, Loader2, Search, FileText, Zap } from 'lucide-react';

interface StreamingMessageProps {
  content: string;
  selectedDocumentCount: number;
}

export function StreamingMessage({ content, selectedDocumentCount }: StreamingMessageProps) {
  const getStageIcon = (content: string) => {
    if (content.includes('Analyzing')) return <Brain className='h-3 w-3 animate-pulse' />;
    if (content.includes('Searching')) return <Search className='h-3 w-3 animate-spin' />;
    if (content.includes('Finding')) return <FileText className='h-3 w-3 animate-bounce' />;
    if (content.includes('Generating')) return <Zap className='h-3 w-3 animate-pulse' />;
    return <Loader2 className='h-3 w-3 animate-spin' />;
  };

  return (
    <div className='flex gap-2 max-w-3xl mr-auto'>
      {/* Avatar */}
      <Avatar className='w-6 h-6 shrink-0'>
        <AvatarFallback className='bg-gradient-to-r from-primary/80 to-primary text-primary-foreground'>
          <Brain className='h-3 w-3' />
        </AvatarFallback>
      </Avatar>

      {/* Streaming Content */}
      <Card className='p-3 max-w-xl bg-card/80 border border-primary/20'>
        <div className='space-y-2'>
          {/* Processing Stage */}
          <div className='flex items-center gap-2'>
            {getStageIcon(content)}
            <span className='text-xs font-medium text-primary animate-typing'>
              {content}
            </span>
          </div>

          {/* Context Info */}
          {selectedDocumentCount > 0 && (
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <FileText className='h-3 w-3' />
              <span>
                Searching through {selectedDocumentCount} document{selectedDocumentCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Typing Indicator */}
          <div className='flex items-center gap-1'>
            <div className='flex space-x-1'>
              <div className='w-1 h-1 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
              <div className='w-1 h-1 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
              <div className='w-1 h-1 bg-primary/60 rounded-full animate-bounce'></div>
            </div>
            <span className='text-xs text-muted-foreground ml-2'>Stealth AI is thinking...</span>
          </div>
        </div>
      </Card>
    </div>
  );
}