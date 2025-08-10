import { createClient } from '@/lib/utils/supabase/server';
// import { generateEmbedding, chunkText } from './embeddings';

export interface ProcessedChunk {
  content: string;
  embedding: number[];
  chunkIndex: number;
  metadata: Record<string, unknown>;
}

export async function processDocumentText(
  documentId: string,
  text: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  // Temporarily disable vector processing to avoid dependency issues
  console.log('Document processing queued for:', documentId);
  console.log('Text length:', text.length);
  console.log('Metadata:', metadata);
  
  // TODO: Implement vector processing when Ollama is available
  return Promise.resolve();
}

export async function searchDocuments(
  query: string,
  documentIds?: string[],
  threshold: number = 0.7,
  limit: number = 5
): Promise<any[]> {
  // Temporarily return empty results until vector search is implemented
  console.log('Document search requested for:', query);
  console.log('Document IDs:', documentIds);
  return [];
}