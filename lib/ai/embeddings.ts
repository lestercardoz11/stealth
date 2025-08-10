import { generateEmbedding as ollamaGenerateEmbedding } from './ollama-client';


export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log('Generating embedding for text length:', text.length);
    return await ollamaGenerateEmbedding(text);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  console.log('Chunking text of length:', text.length);
  
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

  const filteredChunks = chunks.filter(chunk => chunk.length > 50); // Filter out very short chunks
  console.log(`Created ${filteredChunks.length} chunks from ${chunks.length} initial chunks`);
  
  return filteredChunks;
}