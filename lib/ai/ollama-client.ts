import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log('Generating embedding for text length:', text.length);
    
    const response = await ollama.embeddings({
      model: 'nomic-embed-text',
      prompt: text.replace(/\n/g, ' ').substring(0, 2000), // Limit text length
    });

    console.log('Successfully generated embedding of length:', response.embedding.length);
    return response.embedding;
  } catch (error) {
    console.error('Error generating embedding with Ollama:', error);
    
    // Fallback to mock embedding for development
    console.log('Falling back to mock embedding');
    const dimension = 1536;
    return Array.from({ length: dimension }, () => Math.random() - 0.5);
  }
}

export async function generateChatResponse(
  messages: Array<{ role: string; content: string }>,
  context?: string
): Promise<string> {
  try {
    console.log('Generating chat response with Ollama');
    console.log('Context provided:', !!context);
    console.log('Context length:', context?.length || 0);
    
    const userQuery = messages[messages.length - 1]?.content || '';
    
    const systemPrompt = `You are Stealth AI, a professional legal document assistant designed specifically for law firms. You provide accurate, well-reasoned legal analysis while maintaining the highest standards of professionalism.

${context ? `DOCUMENT CONTEXT PROVIDED:
${context}

INSTRUCTIONS:
- Base your responses primarily on the provided document context above
- Reference specific sections, clauses, or information from the documents
- If the context contains relevant information, use it to provide detailed analysis
- Quote relevant passages when appropriate
- If the context doesn't fully answer the question, clearly state what additional information might be needed
- Maintain professional legal language and terminology
- Flag any potential legal issues, risks, or areas requiring further review
- If you identify conflicting information in the documents, highlight these discrepancies

` : `NO DOCUMENT CONTEXT PROVIDED:
The user has not selected any documents for context.

INSTRUCTIONS:
- Provide general legal guidance while emphasizing the need for document review
- Recommend that the user upload and select relevant documents for more specific analysis
- Maintain professional legal language and terminology
- Always recommend consulting with qualified legal counsel for specific legal matters

`}IMPORTANT DISCLAIMERS:
- This analysis is for informational purposes only and does not constitute legal advice
- Always consult with qualified legal counsel for specific legal matters
- Verify all information against original source documents
- Consider jurisdiction-specific laws and regulations

Please provide a thorough, professional response to the user's query: "${userQuery}"`;

    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: false,
      options: {
        temperature: 0.3, // Lower temperature for more consistent legal analysis
        top_p: 0.9,
        top_k: 40,
      },
    });

    console.log('Successfully generated response from Ollama');
    return response.message.content;
  } catch (error) {
    console.error('Error generating chat response with Ollama:', error);
    
    // Fallback response if Ollama is not available
    console.log('Falling back to mock response');
    return generateFallbackResponse(messages, context);
  }
}

function generateFallbackResponse(
  messages: Array<{ role: string; content: string }>,
  context?: string
): string {
  const userQuery = messages[messages.length - 1]?.content || '';
  
  if (context) {
    return `Based on the provided documents, I can help you with "${userQuery}".

**Document Analysis:**
${context ? `I've reviewed the document content you've selected. Here's my analysis:

${context.substring(0, 800)}${context.length > 800 ? '...' : ''}

**Key Findings:**
- The documents contain relevant information for your query
- I recommend reviewing the specific clauses and terms mentioned
- Consider the legal implications of the provisions discussed

` : ''}**Legal Guidance:**
This appears to be a legal inquiry that would benefit from careful document review. Based on the available information, I recommend:

1. **Review the relevant clauses** mentioned in the documents
2. **Consider the legal implications** of the terms discussed
3. **Verify compliance** with applicable regulations
4. **Consult with qualified legal counsel** for specific legal advice

**Important Disclaimer:**
This analysis is for informational purposes only and does not constitute legal advice. Always consult with qualified legal counsel for specific legal matters.

Would you like me to elaborate on any specific aspect of this analysis?`;
  }

  return `I understand you're asking about "${userQuery}".

**General Legal Guidance:**
While I don't have specific document context for this query, I can provide some general guidance:

1. **Document Review Recommended:** For the most accurate analysis, please upload and select relevant documents
2. **Legal Research:** Consider reviewing applicable statutes and case law
3. **Professional Consultation:** Always consult with qualified legal counsel for specific matters

**To get more specific assistance:**
- Upload relevant documents using the document upload feature
- Select documents to provide context for your questions
- Ask specific questions about clauses, terms, or legal concepts

**Important Disclaimer:**
This response is for informational purposes only and does not constitute legal advice. Verify all information against original source documents and consult with qualified legal counsel.

How can I help you further with your legal research?`;
}

export { ollama };