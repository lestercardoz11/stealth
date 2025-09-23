'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Brain } from 'lucide-react';
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
      return (
        date.toLocaleDateString('en-GB') +
        ', ' +
        date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
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
            'text-xs font-medium',
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
            'p-2.5 max-w-xl border-0 mb-2',
            isUser
              ? 'ml-auto bg-primary text-primary-foreground shadow-sm'
              : 'mr-auto bg-card/80 backdrop-blur shadow-sm'
          )}>
          <div className='space-y-1'>
            {/* Message Text */}
            <div className='prose prose-xs max-w-none dark:prose-invert text-xs leading-relaxed'>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            <div className='flex space-x-2'>
              {/* Timestamp */}
              <p
                className={cn(
                  'text-xs opacity-60 mt-1',
                  isUser
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                )}>
                {getFormattedTime()}
              </p>

              {!isUser &&
                sources.slice(0, 3).map((source, index) => (
                  <div key={`${source.documentId}-${index}`}>
                    <Badge
                      variant='outline'
                      className='text-xs p-2 h-3.5 bg-primary/5 mx-1'>
                      {source.documentTitle}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
