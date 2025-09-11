'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Brain, FileText, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/lib/types/database';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Handle different date formats from the database
  const getFormattedTime = () => {
    if (!message.created_at) return '';

    try {
      const date = new Date(message.created_at);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (err) {
      console.error('Invalid date format:', err);
      return '';
    }
  };

  // Get sources from the message
  const sources = message.sources || [];

  return (
    <div
      className={cn(
        'flex gap-2 max-w-3xl',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}>
      {/* Avatar */}
      <Avatar className='w-6 h-6 shrink-0'>
        <AvatarFallback
          className={cn(
            'text-xs font-medium text-xs',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-gradient-to-r from-primary/80 to-primary text-primary-foreground'
          )}>
          {isUser ? (
            <User className='h-2.5 w-2.5' />
          ) : (
            <Brain className='h-2.5 w-2.5' />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn('flex-1 space-y-1', isUser ? 'text-right' : 'text-left')}>
        {/* Message Card */}
        <Card
          className={cn(
            'p-2.5 max-w-xl border-0',
            isUser
              ? 'ml-auto bg-primary text-primary-foreground shadow-sm'
              : 'mr-auto bg-card/80 backdrop-blur shadow-sm'
          )}>
          <div className='space-y-1'>
            {/* Message Text */}
            <div className='prose prose-xs max-w-none dark:prose-invert text-xs leading-relaxed'>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Timestamp */}
            <p
              className={cn(
                'text-xs opacity-60 mt-1',
                isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}>
              {getFormattedTime()}
            </p>
          </div>
        </Card>

        {/* Sources (only for assistant messages) */}
        {!isUser && sources.length > 0 && (
          <Card className='p-2 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
            <div className='flex items-center gap-1 mb-2'>
              <Quote className='h-2.5 w-2.5 text-primary' />
              <span className='text-xs font-medium text-primary'>
                RAG Sources Referenced ({sources.length})
              </span>
            </div>

            <div className='space-y-1'>
              {sources.slice(0, 3).map((source, index) => (
                <div
                  key={`${source.documentId}-${index}`}
                  className='flex items-start gap-2 p-1.5 bg-card/60 rounded border border-primary/10'>
                  <FileText className='h-2.5 w-2.5 text-primary mt-0.5 shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-medium truncate'>
                      {source.documentTitle}
                    </p>
                    <p className='text-xs text-muted-foreground line-clamp-2 leading-tight mt-0.5'>
                      {source.content}
                    </p>
                    <div className='flex items-center gap-1 mt-1'>
                      <Badge variant='outline' className='text-xs px-1 py-0 h-3.5 bg-primary/5'>
                        {Math.round(source.similarity * 100)}% similarity
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {sources.length > 3 && (
                <button
                  className='w-full h-4 text-xs text-muted-foreground hover:text-foreground transition-colors'
                  onClick={() => {
                    // Could expand to show all sources
                    console.log('Show all sources');
                  }}>
                  +{sources.length - 3} more sources
                </button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
