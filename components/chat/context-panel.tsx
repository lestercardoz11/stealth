'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ExternalLink, Search } from 'lucide-react';

interface ContextPanelProps {
  sources: Array<{
    documentId: string;
    documentTitle: string;
    similarity: number;
    content: string;
  }>;
}

export function ContextPanel({ sources }: ContextPanelProps) {
  if (sources.length === 0) return null;

  return (
    <div className='w-80 border-l bg-background'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm flex items-center gap-2'>
          <Search className='h-4 w-4 text-blue-600' />
          RAG Context Sources
        </CardTitle>
        <p className='text-xs text-muted-foreground'>
          Vector search results used for AI response generation
        </p>
      </CardHeader>

      <ScrollArea className='h-[calc(100vh-200px)]'>
        <CardContent className='space-y-3'>
          {sources.map((source, index) => (
            <Card
              key={`${source.documentId}-${index}`}
              className='p-3 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10'>
              <div className='space-y-2'>
                {/* Document Title */}
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <FileText className='h-3 w-3 text-blue-600 shrink-0' />
                    <p className='text-xs font-medium truncate'>
                      {source.documentTitle}
                    </p>
                  </div>
                  <ExternalLink className='h-3 w-3 text-muted-foreground shrink-0' />
                </div>

                {/* Similarity Score */}
                <div className='flex items-center gap-2'>
                  <Search className='h-3 w-3 text-green-600' />
                  <Badge variant='outline' className='text-xs px-1 py-0'>
                    {Math.round(source.similarity * 100)}% vector similarity
                  </Badge>
                </div>

                {/* Content Preview */}
                <div className='p-2 bg-muted/50 rounded text-xs'>
                  <p className='text-muted-foreground line-clamp-4'>
                    {source.content}
                  </p>
                </div>

                <div className='text-xs text-blue-600 dark:text-blue-400'>
                  📊 Chunk #{index + 1} • Vector match
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </ScrollArea>
    </div>
  );
}
