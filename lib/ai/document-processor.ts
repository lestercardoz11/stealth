import { createClient } from '@/lib/utils/supabase/server';
import { generateEmbedding } from './ollama-client';

export interface ProcessedChunk {
  content: string;
  embedding: number[];
  chunkIndex: number;
  metadata: Record<string, unknown>;
}

export function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  console.log('Chunking text of length:', text.length);

  if (!text || text.trim().length === 0) {
    console.log('Empty text provided, returning empty chunks');
    return [];
  }

  // Split by sentences first for better semantic chunks
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (
      currentChunk.length + trimmedSentence.length > maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // If no sentences found, split by paragraphs or words
  if (chunks.length === 0) {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    for (const paragraph of paragraphs) {
      if (paragraph.length <= maxChunkSize) {
        chunks.push(paragraph.trim());
      } else {
        // Split long paragraphs by words
        const words = paragraph.split(/\s+/);
        let currentChunk = '';

        for (const word of words) {
          if (
            currentChunk.length + word.length > maxChunkSize &&
            currentChunk.length > 0
          ) {
            chunks.push(currentChunk.trim());
            currentChunk = word;
          } else {
            currentChunk += (currentChunk ? ' ' : '') + word;
          }
        }

        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
      }
    }
  }

  const filteredChunks = chunks.filter((chunk) => chunk.length > 20); // Filter out very short chunks
  console.log(
    `Created ${filteredChunks.length} chunks from ${chunks.length} initial chunks`
  );

  return filteredChunks;
}

export async function processDocumentText(
  documentId: string,
  text: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    console.log('Starting document processing for:', documentId);

    // Chunk the text into smaller pieces
    const chunks = chunkText(text, 800); // Smaller chunks for better context
    console.log(`Created ${chunks.length} chunks for document ${documentId}`);

    const supabase = await createClient();

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      try {
        console.log(
          `Processing chunk ${i + 1}/${
            chunks.length
          } for document ${documentId}`
        );

        // Generate embedding for this chunk
        const embedding = await generateEmbedding(chunk);
        console.log(
          `Generated embedding of length ${embedding.length} for chunk ${i}`
        );

        // Store chunk and embedding in database
        const { data, error } = await supabase
          .from('document_chunks')
          .insert({
            document_id: documentId,
            content: chunk,
            embedding: embedding, // Store as vector directly
            chunk_index: i,
            metadata: {
              ...metadata,
              chunkLength: chunk.length,
              processedAt: new Date().toISOString(),
            },
          })
          .select();

        if (error) {
          console.error(`Error storing chunk ${i}:`, error);
          throw error;
        }

        console.log(
          `Successfully stored chunk ${i + 1}/${
            chunks.length
          } for document ${documentId}`,
          data
        );

        // Add small delay to avoid overwhelming the system
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
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
): Promise<
  Array<{
    id: string;
    document_id: string;
    content: string;
    metadata: Record<string, unknown>;
    similarity: number;
    document_title: string;
  }>
> {
  try {
    console.log('Starting document search for query:', query);
    console.log('Using document IDs:', documentIds);
    console.log(`Threshold: ${threshold}, Limit: ${limit}`);

    const supabase = await createClient();

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);
    console.log('Generated query embedding');

    // Use the vector similarity search function
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      document_ids: documentIds || null,
    });

    if (error) {
      console.error('Vector search error:', error);
      // Fallback to text search
      const { data: fallbackData, error: fallbackError } = await supabase.rpc(
        'search_documents_text',
        {
          search_query: query,
          match_count: limit,
          document_ids: documentIds || null,
        }
      );

      if (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        return [];
      }

      console.log(
        `Fallback text search found ${fallbackData?.length || 0} chunks`
      );
      return fallbackData || [];
    }

    console.log(`Vector search found ${data?.length || 0} relevant chunks`);
    return data || [];
  } catch (error) {
    console.error('Document search error:', error);
    return []; // Return empty array instead of throwing
  }
}
