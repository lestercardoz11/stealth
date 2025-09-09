'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Brain, ExternalLink, FileText, Quote } from 'lucide-react';
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
      <Avatar className='w-7 h-7 shrink-0'>
        <AvatarFallback
          className={cn(
            'text-xs font-medium',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
          )}>
          {isUser ? (
            <User className='h-3 w-3' />
          ) : (
            <Brain className='h-3 w-3' />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div
        className={cn('flex-1 space-y-1', isUser ? 'text-right' : 'text-left')}>
        {/* Message Card */}
        <Card
          className={cn(
            'p-3 max-w-xl',
            isUser
              ? 'ml-auto bg-primary text-primary-foreground'
              : 'mr-auto bg-background border'
          )}>
          <div className='space-y-1'>
            {/* Message Text */}
            <div className='prose prose-xs max-w-none dark:prose-invert text-sm leading-relaxed'>
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
          <Card className='p-2 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/5 dark:to-purple-900/5 border-blue-100 dark:border-blue-900'>
            <div className='flex items-center gap-1 mb-2'>
              <Quote className='h-3 w-3 text-blue-500' />
              <span className='text-xs font-medium text-blue-600 dark:text-blue-400'>
                RAG Sources Referenced ({sources.length})
              </span>
            </div>

            <div className='space-y-1'>
              {sources.slice(0, 3).map((source, index) => (
                <div
                  key={`${source.documentId}-${index}`}
                  className='flex items-start gap-2 p-2 bg-white/60 dark:bg-gray-800/60 rounded border border-blue-100 dark:border-blue-900'>
                  <FileText className='h-3 w-3 text-blue-500 mt-0.5 shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-medium truncate text-gray-700 dark:text-gray-200'>
                      {source.documentTitle}
                    </p>
                    <p className='text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-tight mt-0.5'>
                      {source.content}
                    </p>
                    <div className='flex items-center gap-1 mt-1'>
                      <Badge variant='outline' className='text-xs px-1 py-0 bg-blue-50 dark:bg-blue-900/20'>
                        {Math.round(source.similarity * 100)}% similarity
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {sources.length > 3 && (
                <Button
                  variant='ghost'
                  size='sm' 
                  className='w-full h-5 text-xs text-muted-foreground hover:text-foreground'
                  onClick={() => {
                    // Could expand to show all sources
                    console.log('Show all sources');
                  }}>
                  +{sources.length - 3} more sources
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
