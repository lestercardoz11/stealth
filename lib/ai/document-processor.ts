import { createClient } from '@/lib/utils/supabase/server';
import { generateEmbedding, chunkText } from './embeddings';

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
  const supabase = await createClient();
  
  try {
    // Split text into chunks
    const chunks = chunkText(text, 1000);
    
    // Process chunks in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      const processedChunks = await Promise.all(
        batch.map(async (chunk, index) => {
          const embedding = await generateEmbedding(chunk);
          return {
            document_id: documentId,
            content: chunk,
            embedding: `[${embedding.join(',')}]`, // PostgreSQL vector format
            chunk_index: i + index,
            metadata: {
              ...metadata,
              length: chunk.length,
              wordCount: chunk.split(' ').length,
            },
          };
        })
      );

      // Insert batch into database
      const { error } = await supabase
        .from('document_chunks')
        .insert(processedChunks);

      if (error) {
        console.error('Error inserting chunks:', error);
        throw error;
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Processed ${chunks.length} chunks for document ${documentId}`);
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

export async function searchDocuments(
  query: string,
  documentIds?: string[],
  threshold: number = 0.7,
  limit: number = 5
) {
  const supabase = await createClient();
  
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search for similar chunks
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: threshold,
      match_count: limit,
      document_ids: documentIds || null,
    });

    if (error) {
      console.error('Error searching documents:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in document search:', error);
    throw error;
  }
}