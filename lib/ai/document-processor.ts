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
  try {
    console.log('Starting document processing for:', documentId);
    
    // Chunk the text into smaller pieces
    const chunks = chunkText(text, 1000);
    console.log(`Created ${chunks.length} chunks for document ${documentId}`);
    
    const supabase = await createClient();
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        // Generate embedding for this chunk
        const embedding = await generateEmbedding(chunk);
        
        // Store chunk and embedding in database
        const { error } = await supabase
          .from('document_chunks')
          .insert({
            document_id: documentId,
            content: chunk,
            embedding: embedding,
            chunk_index: i,
            metadata: {
              ...metadata,
              chunkLength: chunk.length,
              processedAt: new Date().toISOString()
            }
          });
        
        if (error) {
          console.error(`Error storing chunk ${i}:`, error);
          throw error;
        }
        
        console.log(`Processed chunk ${i + 1}/${chunks.length} for document ${documentId}`);
        
        // Add small delay to avoid overwhelming Ollama
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (chunkError) {
        console.error(`Error processing chunk ${i}:`, chunkError);
        // Continue with other chunks even if one fails
      }
    }
    
    console.log(`Document processing completed for ${documentId}`);
  } catch (error) {
    console.error('Document processing error:', error);
    throw new Error('Failed to process document for vector search');
  }
}

export async function searchDocuments(
  query: string,
  documentIds?: string[],
  threshold: number = 0.7,
  limit: number = 5
): Promise<Array<{
  id: string;
  document_id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
  document_title: string;
}>> {
  try {
    console.log('Starting document search for query:', query);
    console.log('Using document IDs:', documentIds);
    console.log(`Threshold: ${threshold}, Limit: ${limit}`);
    
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);
    
    const supabase = await createClient();
    
    // Call the vector similarity search function
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      document_ids: documentIds || null
    });
    
    if (error) {
      console.error('Vector search error:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} relevant chunks`);
    return data || [];
  } catch (error) {
    console.error('Document search error:', error);
    throw new Error('Failed to search documents');
  }
}