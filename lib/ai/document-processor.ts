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
        console.log(`Processing chunk ${i + 1}/${chunks.length} for document ${documentId}`);
        
        // Generate embedding for this chunk
        const embedding = await generateEmbedding(chunk);
        console.log(`Generated embedding of length ${embedding.length} for chunk ${i}`);
        
        // Store chunk and embedding in database
        const { data, error } = await supabase
          .from('document_chunks')
          .insert({
            document_id: documentId,
            content: chunk,
            embedding: JSON.stringify(embedding), // Store as JSON string for compatibility
            chunk_index: i,
            metadata: {
              ...metadata,
              chunkLength: chunk.length,
              processedAt: new Date().toISOString()
            }
          })
          .select();
        
        if (error) {
          console.error(`Error storing chunk ${i}:`, error);
          throw error;
        }
        
        console.log(`Successfully stored chunk ${i + 1}/${chunks.length} for document ${documentId}`, data);
        
        // Add small delay to avoid overwhelming the system
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
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
    
    const supabase = await createClient();
    
    // For now, implement a simple text search until vector search is properly configured
    let query_builder = supabase
      .from('document_chunks')
      .select(`
        id,
        document_id,
        content,
        metadata,
        documents!inner(title)
      `)
      .textSearch('content', query, { type: 'websearch' })
      .limit(limit);
    
    if (documentIds && documentIds.length > 0) {
      query_builder = query_builder.in('document_id', documentIds);
    }
    
    const { data, error } = await query_builder;
    
    if (error) {
      console.error('Document search error:', error);
      // Fallback to basic content search
      const fallbackQuery = supabase
        .from('document_chunks')
        .select(`
          id,
          document_id,
          content,
          metadata,
          documents!inner(title)
        `)
        .ilike('content', `%${query}%`)
        .limit(limit);
      
      if (documentIds && documentIds.length > 0) {
        fallbackQuery.in('document_id', documentIds);
      }
      
      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      
      if (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        return [];
      }
      
      console.log(`Fallback search found ${fallbackData?.length || 0} chunks`);
      
      return (fallbackData || []).map((chunk: any) => ({
        id: chunk.id,
        document_id: chunk.document_id,
        content: chunk.content,
        metadata: chunk.metadata || {},
        similarity: 0.8, // Mock similarity for text search
        document_title: chunk.documents?.title || 'Unknown Document'
      }));
    }
    
    console.log(`Found ${data?.length || 0} relevant chunks`);
    
    return (data || []).map((chunk: any) => ({
      id: chunk.id,
      document_id: chunk.document_id,
      content: chunk.content,
      metadata: chunk.metadata || {},
      similarity: 0.8, // Mock similarity for now
      document_title: chunk.documents?.title || 'Unknown Document'
    }));
  } catch (error) {
    console.error('Document search error:', error);
    return []; // Return empty array instead of throwing
  }
}