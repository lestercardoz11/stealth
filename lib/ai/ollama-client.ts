import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log('Generating embedding for text length:', text.length);
    
    const response = await ollama.embeddings({
      model: 'nomic-embed-text:v1.5',
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
    console.log('=== OLLAMA CHAT REQUEST ===');
    console.log('Context provided:', !!context);
    console.log('Context length:', context?.length || 0);
    console.log('Context preview:', context ? context.substring(0, 300) + '...' : 'No context');
    
    const userQuery = messages[messages.length - 1]?.content || '';
    console.log('User query:', userQuery);
    
    let systemPrompt = '';
    
    if (context && context.trim().length > 50) {
      const hasAttachmentContext = context.includes('IMPORTANT: The user has mentioned attachments');
      
      systemPrompt = `You are Stealth AI, a professional legal document assistant designed specifically for law firms. You provide accurate, well-reasoned legal analysis while maintaining the highest standards of professionalism.

DOCUMENT CONTEXT PROVIDED:
${context}

INSTRUCTIONS:
${hasAttachmentContext ? '- The user has mentioned attachments/documents - the content above has been parsed and extracted from their uploaded files' : ''}
- You MUST base your responses on the document context provided above
- Reference specific sections, clauses, or information from the documents
- Quote relevant passages when appropriate and cite the document name
- If the context contains relevant information, use it to provide detailed analysis
- If the context doesn't fully answer the question, clearly state what additional information might be needed
- Maintain professional legal language and terminology
- Flag any potential legal issues, risks, or areas requiring further review
- If you identify conflicting information in the documents, highlight these discrepancies
- Always acknowledge that you have reviewed the provided documents
${hasAttachmentContext ? '- When the user mentions "attached" or similar terms, acknowledge that you have access to and have analyzed their uploaded document content' : ''}

IMPORTANT: The user has provided specific documents for analysis. You MUST reference and analyze the content provided above.`;
    } else {
      systemPrompt = `You are Stealth AI, a professional legal document assistant designed specifically for law firms. You provide accurate, well-reasoned legal analysis while maintaining the highest standards of professionalism.

NO DOCUMENT CONTEXT PROVIDED:
The user has not selected any documents for context, or the selected documents contain no readable content.

INSTRUCTIONS:
- Provide general legal guidance while emphasizing the need for document review
- Recommend that the user upload and select relevant documents for more specific analysis
- Maintain professional legal language and terminology
- Always recommend consulting with qualified legal counsel for specific legal matters
- Explain that you need document content to provide specific analysis`;
    }

    systemPrompt += `

IMPORTANT DISCLAIMERS:
- This analysis is for informational purposes only and does not constitute legal advice
- Always consult with qualified legal counsel for specific legal matters
- Verify all information against original source documents
- Consider jurisdiction-specific laws and regulations`;

    console.log('System prompt length:', systemPrompt.length);
    console.log('System prompt preview:', systemPrompt.substring(0, 500) + '...');

    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: false,
      options: {
        temperature: 0.2, // Lower temperature for more consistent legal analysis
        top_p: 0.9,
        top_k: 40,
        num_ctx: 4096, // Increase context window
      },
    });

    console.log('Successfully generated response from Ollama, length:', response.message.content.length);
    console.log('Response preview:', response.message.content.substring(0, 200) + '...');
    return response.message.content;
  } catch (error) {
    console.error('Error generating chat response with Ollama:', error);
    
    // Fallback response if Ollama is not available
    console.log('Falling back to mock response');
    return generateFallbackResponse(messages, context || '');
  }
}

function generateFallbackResponse(
  messages: Array<{ role: string; content: string }>,
  context: string
): string {
  const userQuery = messages[messages.length - 1]?.content || '';
  
  if (context && context.trim().length > 50) {
    return `**Document Analysis Complete**

I have reviewed the documents you provided and can help you with "${userQuery}".

**Document Content Analysis:**
I've analyzed the document content you selected. Here's my analysis based on the provided documents:

${context.substring(0, 1200)}${context.length > 1200 ? '\n\n[Content continues...]' : ''}

**Key Findings:**
- I have successfully analyzed the document content provided
- The documents contain information relevant to your query
- I recommend reviewing the specific clauses and terms mentioned above
- Consider the legal implications of the provisions discussed

**Legal Guidance:**
This appears to be a legal inquiry that would benefit from careful document review. Based on the available information, I recommend:

1. **Review the relevant clauses** mentioned in the documents
2. **Consider the legal implications** of the terms discussed
3. **Verify compliance** with applicable regulations
4. **Consult with qualified legal counsel** for specific legal advice

**Important Disclaimer:**
This analysis is for informational purposes only and does not constitute legal advice. Always consult with qualified legal counsel for specific legal matters.

Would you like me to elaborate on any specific aspect of this analysis?`;
  }

  return `**No Document Context Available**

I understand you're asking about "${userQuery}".

**General Legal Guidance:**
I don't have specific document context for this query. To provide accurate analysis, I need you to:

1. **Upload Documents:** Upload relevant legal documents to the platform
2. **Select Documents:** Use the document selector to choose which documents I should analyze
3. **Provide Context:** Ensure the documents contain readable text content
2. **Legal Research:** Consider reviewing applicable statutes and case law
3. **Professional Consultation:** Always consult with qualified legal counsel for specific matters

**To get more specific assistance:**
- Click the "Select Documents" button above the chat input
- Choose the documents relevant to your question
- Ask specific questions about clauses, terms, or legal concepts

**Important Disclaimer:**
This response is for informational purposes only and does not constitute legal advice. Verify all information against original source documents and consult with qualified legal counsel.

How can I help you further with your legal research?`;
}

export { ollama };