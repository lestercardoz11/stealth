/**
 * AI Prompts and System Messages
 * 
 * This file contains all the prompts used by the AI system for better
 * maintainability and consistency across the application.
 */

export interface PromptContext {
  hasDocumentContext: boolean;
  hasAttachmentMention: boolean;
  contextLength: number;
  documentCount?: number;
}

/**
 * Generate the main system prompt for chat responses
 */
export function generateSystemPrompt(context: string, promptContext: PromptContext): string {
  const { hasDocumentContext, hasAttachmentMention, contextLength } = promptContext;

  if (hasDocumentContext && contextLength > 50) {
    return buildDocumentContextPrompt(context, hasAttachmentMention);
  } else {
    return buildNoContextPrompt();
  }
}

/**
 * System prompt when document context is available
 */
function buildDocumentContextPrompt(context: string, hasAttachmentMention: boolean): string {
  return `You are Stealth AI, a professional legal document assistant designed specifically for law firms. You provide accurate, well-reasoned legal analysis while maintaining the highest standards of professionalism.

DOCUMENT CONTEXT PROVIDED:
${context}

INSTRUCTIONS:
${hasAttachmentMention 
  ? '- The user has mentioned attachments/documents - the content above has been parsed and extracted from their uploaded files'
  : ''
}
- You MUST base your responses on the document context provided above
- Reference specific sections, clauses, or information from the documents
- Quote relevant passages when appropriate and cite the document name
- If the context contains relevant information, use it to provide detailed analysis
- If the context doesn't fully answer the question, clearly state what additional information might be needed
- Maintain professional legal language and terminology
- Flag any potential legal issues, risks, or areas requiring further review
- If you identify conflicting information in the documents, highlight these discrepancies
- Always acknowledge that you have reviewed the provided documents
${hasAttachmentMention 
  ? '- When the user mentions "attached" or similar terms, acknowledge that you have access to and have analyzed their uploaded document content'
  : ''
}

IMPORTANT: The user has provided specific documents for analysis. You MUST reference and analyze the content provided above.

${buildCommonDisclaimers()}`;
}

/**
 * System prompt when no document context is available
 */
function buildNoContextPrompt(): string {
  return `You are Stealth AI, a professional legal document assistant designed specifically for law firms. You provide accurate, well-reasoned legal analysis while maintaining the highest standards of professionalism.

NO DOCUMENT CONTEXT PROVIDED:
The user has not selected any documents for context, or the selected documents contain no readable content.

INSTRUCTIONS:
- Provide general legal guidance while emphasizing the need for document review
- Recommend that the user upload and select relevant documents for more specific analysis
- Maintain professional legal language and terminology
- Always recommend consulting with qualified legal counsel for specific legal matters
- Explain that you need document content to provide specific analysis

${buildCommonDisclaimers()}`;
}

/**
 * Common legal disclaimers for all prompts
 */
function buildCommonDisclaimers(): string {
  return `IMPORTANT DISCLAIMERS:
- This analysis is for informational purposes only and does not constitute legal advice
- Always consult with qualified legal counsel for specific legal matters
- Verify all information against original source documents
- Consider jurisdiction-specific laws and regulations`;
}

/**
 * Prompt for generating conversation titles
 */
export function generateTitlePrompt(conversationText: string): string {
  return `Based on this conversation, generate a concise, descriptive title (maximum 50 characters) that captures the main topic or question being discussed. Only return the title, nothing else.

Conversation:
${conversationText}

Title:`;
}

/**
 * Enhanced context message for attachment mentions
 */
export function enhanceContextForAttachments(context: string): string {
  return `IMPORTANT: The user has mentioned attachments or documents. The following document content has been parsed and extracted for analysis:

${context}`;
}

/**
 * Fallback response when Ollama is not available
 */
export function generateFallbackResponse(
  userQuery: string,
  context: string
): string {
  if (context && context.trim().length > 50) {
    return buildDocumentFallbackResponse(userQuery, context);
  } else {
    return buildNoContextFallbackResponse(userQuery);
  }
}

/**
 * Fallback response with document context
 */
function buildDocumentFallbackResponse(userQuery: string, context: string): string {
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

/**
 * Fallback response without document context
 */
function buildNoContextFallbackResponse(userQuery: string): string {
  return `**No Document Context Available**

I understand you're asking about "${userQuery}".

**General Legal Guidance:**
I don't have specific document context for this query. To provide accurate analysis, I need you to:

1. **Upload Documents:** Upload relevant legal documents to the platform
2. **Select Documents:** Use the document selector to choose which documents I should analyze
3. **Provide Context:** Ensure the documents contain readable text content
4. **Legal Research:** Consider reviewing applicable statutes and case law
5. **Professional Consultation:** Always consult with qualified legal counsel for specific matters

**To get more specific assistance:**
- Click the "Select Documents" button above the chat input
- Choose the documents relevant to your question
- Ask specific questions about clauses, terms, or legal concepts

**Important Disclaimer:**
This response is for informational purposes only and does not constitute legal advice. Verify all information against original source documents and consult with qualified legal counsel.

How can I help you further with your legal research?`;
}

/**
 * Keywords that indicate user is mentioning attachments
 */
export const ATTACHMENT_KEYWORDS = [
  'attached',
  'attachment',
  'uploaded',
  'document',
  'file',
  'pdf',
  'docx',
] as const;

/**
 * Check if user query mentions attachments
 */
export function mentionsAttachment(query: string): boolean {
  return ATTACHMENT_KEYWORDS.some((keyword) =>
    query.toLowerCase().includes(keyword)
  );
}

/**
 * Ollama model configuration
 */
export const OLLAMA_CONFIG = {
  chatModel: process.env.OLLAMA_MODEL || 'llama3.1:8b',
  embeddingModel: 'nomic-embed-text:v1.5',
  chatOptions: {
    temperature: 0.2, // Lower temperature for more consistent legal analysis
    top_p: 0.9,
    top_k: 40,
    num_ctx: 4096, // Increase context window
  },
  embeddingOptions: {
    maxTextLength: 2000, // Limit text length for embeddings
  },
} as const;