import { Ollama } from 'ollama';
import {
  generateSystemPrompt,
  generateTitlePrompt,
  generateFallbackResponse,
  OLLAMA_CONFIG,
  type PromptContext,
} from './prompts';

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log('Generating embedding for text length:', text.length);

    const response = await ollama.embeddings({
      model: OLLAMA_CONFIG.embeddingModel,
      prompt: text
        .replace(/\n/g, ' ')
        .substring(0, OLLAMA_CONFIG.embeddingOptions.maxTextLength),
    });

    console.log(
      'Successfully generated embedding of length:',
      response.embedding.length
    );
    return response.embedding;
  } catch (error) {
    console.error('Error generating embedding with Ollama:', error);

    // Fallback to mock embedding for development - Fixed dimension to match nomic-embed-text
    console.log('Falling back to mock embedding');
    const dimension = 768; // Changed from 1536 to match nomic-embed-text
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
    console.log(
      'Context preview:',
      context ? context.substring(0, 300) + '...' : 'No context'
    );

    const userQuery = messages[messages.length - 1]?.content || '';
    console.log('User query:', userQuery);

    // Create prompt context
    const promptContext: PromptContext = {
      hasDocumentContext: !!(context && context.trim().length > 50),
      hasAttachmentMention:
        context?.includes('IMPORTANT: The user has mentioned attachments') ||
        false,
      contextLength: context?.length || 0,
    };

    // Generate system prompt using the prompts module
    const systemPrompt = generateSystemPrompt(context || '', promptContext);

    console.log('System prompt length:', systemPrompt.length);
    console.log(
      'System prompt preview:',
      systemPrompt.substring(0, 500) + '...'
    );

    const response = await ollama.chat({
      model: OLLAMA_CONFIG.chatModel,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: false,
      options: OLLAMA_CONFIG.chatOptions,
    });

    console.log(
      'Successfully generated response from Ollama, length:',
      response.message.content.length
    );
    console.log(
      'Response preview:',
      response.message.content.substring(0, 200) + '...'
    );
    return response.message.content;
  } catch (error) {
    console.error('Error generating chat response with Ollama:', error);

    // Fallback response if Ollama is not available
    console.log('Falling back to mock response');
    const userQuery = messages[messages.length - 1]?.content || '';
    return generateFallbackResponse(userQuery, context || '');
  }
}

/**
 * Generate title for conversations using Ollama
 */
export async function generateConversationTitle(
  conversationText: string
): Promise<string> {
  try {
    const titlePrompt = generateTitlePrompt(conversationText);

    const response = await ollama.chat({
      model: OLLAMA_CONFIG.chatModel,
      messages: [{ role: 'user', content: titlePrompt }],
      stream: false,
      options: {
        ...OLLAMA_CONFIG.chatOptions,
        temperature: 0.3, // Slightly higher temperature for more creative titles
      },
    });

    // Clean up the generated title
    const cleanTitle = response.message.content
      .replace(/^(Title:|Generated Title:|Conversation Title:)/i, '')
      .replace(/['"]/g, '')
      .trim()
      .substring(0, 50);

    return cleanTitle || 'New Conversation';
  } catch (error) {
    console.error('Error generating conversation title:', error);
    return 'New Conversation';
  }
}
