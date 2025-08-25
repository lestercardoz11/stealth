// Simplified embeddings for development - can be enhanced with actual Ollama integration later

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log('Generating mock embedding for text length:', text.length);
    
    // For development, generate a mock embedding vector
    // In production, this would call Ollama or another embedding service
    const dimension = 1536; // Standard embedding dimension
    const embedding = Array.from({ length: dimension }, () => Math.random() - 0.5);
    
    console.log(`Generated mock embedding of dimension ${dimension}`);
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  console.log('Chunking text of length:', text.length);
  
  if (!text || text.trim().length === 0) {
    console.log('Empty text provided, returning empty chunks');
    return [];
  }
  
  // Split by sentences first
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (currentChunk.length + trimmedSentence.length > maxChunkSize && currentChunk.length > 0) {
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
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    for (const paragraph of paragraphs) {
      if (paragraph.length <= maxChunkSize) {
        chunks.push(paragraph.trim());
      } else {
        // Split long paragraphs by words
        const words = paragraph.split(/\s+/);
        let currentChunk = '';
        
        for (const word of words) {
          if (currentChunk.length + word.length > maxChunkSize && currentChunk.length > 0) {
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

  const filteredChunks = chunks.filter(chunk => chunk.length > 20); // Filter out very short chunks
  console.log(`Created ${filteredChunks.length} chunks from ${chunks.length} initial chunks`);
  
  return filteredChunks;
}