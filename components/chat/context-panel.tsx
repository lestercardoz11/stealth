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
    <div className='w-72 border-l bg-background/95'>
      <CardHeader className='pb-2 p-3'>
        <CardTitle className='text-xs flex items-center gap-2'>
          <Search className='h-3 w-3 text-blue-600' />
          RAG Context Sources
        </CardTitle>
        <p className='text-xs text-muted-foreground'>
          Vector search results for AI response
        </p>
      </CardHeader>

      <ScrollArea className='h-[calc(100vh-180px)]'>
        <CardContent className='space-y-2 p-3'>
          {sources.map((source, index) => (
            <Card
              key={`${source.documentId}-${index}`}
              className='p-2 bg-gradient-to-r from-blue-50/20 to-purple-50/20 dark:from-blue-900/5 dark:to-purple-900/5 border-0'>
              <div className='space-y-1'>
                {/* Document Title */}
                <div className='flex items-start justify-between gap-1'>
                  <div className='flex items-center gap-1 min-w-0'>
                    <FileText className='h-3 w-3 text-blue-600 shrink-0' />
                    <p className='text-xs font-medium truncate'>
                      {source.documentTitle}
                    </p>
                  </div>
                </div>

                {/* Similarity Score */}
                <div className='flex items-center gap-1'>
                  <Search className='h-3 w-3 text-green-600' />
                  <Badge variant='outline' className='text-xs px-1 py-0 h-4'>
                    {Math.round(source.similarity * 100)}% vector similarity
                  </Badge>
                </div>

                {/* Content Preview */}
                <div className='p-1.5 bg-muted/30 rounded text-xs'>
                  <p className='text-muted-foreground line-clamp-3 leading-tight'>
                    {source.content}
                  </p>
                </div>

                <div className='text-xs text-blue-500 dark:text-blue-400'>
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
