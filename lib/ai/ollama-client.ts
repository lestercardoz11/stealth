import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ollama.embeddings({
      model: 'nomic-embed-text:v1.5',
      prompt: text.replace(/\n/g, ' '),
    });

    return response.embedding;
  } catch (error) {
    console.error('Error generating embedding with Ollama:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateChatResponse(
  messages: Array<{ role: string; content: string }>,
  context?: string
): Promise<string> {
  try {
    const systemPrompt = `You are Stealth AI, a professional legal document assistant designed specifically for law firms. You provide accurate, well-reasoned legal analysis while maintaining the highest standards of professionalism.

${context ? `DOCUMENT CONTEXT:
${context}

INSTRUCTIONS:
- Base your responses primarily on the provided document context
- If the context doesn't contain sufficient information to answer the question, clearly state this limitation
- When referencing information from documents, be specific about which document you're citing
- Maintain professional legal language and terminology
- Flag any potential legal issues, risks, or areas requiring further review
- If you identify conflicting information in the documents, highlight these discrepancies
- Suggest next steps or additional research when appropriate

` : `INSTRUCTIONS:
- You are operating without specific document context
- Provide general legal guidance while emphasizing the need for document review
- Recommend that the user upload relevant documents for more specific analysis
- Maintain professional legal language and terminology
- Always recommend consulting with qualified legal counsel for specific legal matters

`}IMPORTANT DISCLAIMERS:
- This analysis is for informational purposes only and does not constitute legal advice
- Always consult with qualified legal counsel for specific legal matters
- Verify all information against original source documents
- Consider jurisdiction-specific laws and regulations

Please provide a thorough, professional response to the user's query.`;

    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || 'gemma3:1b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: false,
    });

    return response.message.content;
  } catch (error) {
    console.error('Error generating chat response with Ollama:', error);
    throw new Error('Failed to generate chat response');
  }
}

export { ollama };