'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Search } from 'lucide-react';

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
    <div className='w-64 border-l bg-card/80 backdrop-blur'>
      <CardHeader className='pb-1 p-2'>
        <CardTitle className='text-xs flex items-center gap-1.5'>
          <Search className='h-3 w-3 text-primary' />
          RAG Context Sources
        </CardTitle>
        <p className='text-xs text-muted-foreground leading-tight'>
          Vector search results for AI response
        </p>
      </CardHeader>

      <ScrollArea className='h-[calc(100vh-120px)]'>
        <CardContent className='space-y-1.5 p-2'>
          {sources.map((source, index) => (
            <Card
              key={`${source.documentId}-${index}`}
              className='p-2 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
              <div className='space-y-1'>
                {/* Document Title */}
                <div className='flex items-start justify-between gap-1'>
                  <div className='flex items-center gap-1 min-w-0'>
                    <FileText className='h-2.5 w-2.5 text-primary shrink-0' />
                    <p className='text-xs font-medium truncate leading-tight'>
                      {source.documentTitle}
                    </p>
                  </div>
                </div>

                {/* Similarity Score */}
                <div className='flex items-center gap-1'>
                  <Search className='h-2.5 w-2.5 text-primary' />
                  <Badge variant='outline' className='text-xs px-1 py-0 h-3.5'>
                    {Math.round(source.similarity * 100)}% vector similarity
                  </Badge>
                </div>

                {/* Content Preview */}
                <div className='p-1 bg-muted/20 rounded text-xs'>
                  <p className='text-muted-foreground line-clamp-2 leading-tight'>
                    {source.content}
                  </p>
                </div>

                <div className='text-xs text-primary/70'>
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
