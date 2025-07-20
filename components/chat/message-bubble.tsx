'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Brain, 
  Copy, 
  Check, 
  ExternalLink,
  FileText,
  Quote
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: Date;
  };
  sources?: Array<{
    documentId: string;
    documentTitle: string;
    similarity: number;
    content: string;
  }>;
}

export function MessageBubble({ message, sources = [] }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "flex gap-3 max-w-4xl",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className={cn(
          "text-xs",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        "flex-1 space-y-2",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message Card */}
        <Card className={cn(
          "p-4 max-w-2xl",
          isUser 
            ? "ml-auto bg-primary text-primary-foreground" 
            : "mr-auto bg-background border"
        )}>
          <div className="space-y-2">
            {/* Role Badge */}
            <div className="flex items-center justify-between">
              <Badge variant={isUser ? "secondary" : "outline"} className="text-xs">
                {isUser ? "You" : "Stealth AI"}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className={cn(
                  "h-6 w-6 p-0",
                  isUser ? "text-primary-foreground/70 hover:text-primary-foreground" : ""
                )}
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Message Text */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </div>

            {/* Timestamp */}
            {message.createdAt && (
              <p className={cn(
                "text-xs opacity-70",
                isUser ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {message.createdAt.toLocaleTimeString()}
              </p>
            )}
          </div>
        </Card>

        {/* Sources (only for assistant messages) */}
        {!isUser && sources.length > 0 && (
          <Card className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Quote className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Sources Referenced
              </span>
            </div>
            
            <div className="space-y-2">
              {sources.slice(0, 3).map((source, index) => (
                <div 
                  key={`${source.documentId}-${index}`}
                  className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded border"
                >
                  <FileText className="h-3 w-3 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {source.documentTitle}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {source.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {Math.round(source.similarity * 100)}% match
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 text-xs p-0 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-2 w-2 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {sources.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{sources.length - 3} more sources
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}