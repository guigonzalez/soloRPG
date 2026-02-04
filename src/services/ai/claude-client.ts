import Anthropic from '@anthropic-ai/sdk';
import type { ClaudeMessage } from '../../types/api';
import { getApiKey } from '../storage/api-key-storage';

/**
 * Claude API client with streaming support
 */
export class ClaudeClient {
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    this.model = import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';
    this.maxTokens = parseInt(import.meta.env.VITE_MAX_TOKENS || '2000', 10);
    this.temperature = parseFloat(import.meta.env.VITE_TEMPERATURE || '0.8');
  }

  /**
   * Create Anthropic client with current API key
   */
  private getClient(): Anthropic {
    const apiKey = getApiKey();

    if (!apiKey) {
      throw new Error('API key not configured. Please configure your API key in settings.');
    }

    return new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // For development - in production, use a backend proxy
    });
  }

  /**
   * Send a message and get a streaming response
   */
  async sendMessage(
    systemPrompt: string,
    messages: ClaudeMessage[],
    onChunk: (text: string) => void
  ): Promise<string> {
    const client = this.getClient();

    try {
      const stream = await client.messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          const text = chunk.delta.text;
          fullResponse += text;
          onChunk(text);
        }
      }

      return fullResponse;
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Send a message without streaming (for memory extraction)
   */
  async sendMessageSync(
    systemPrompt: string,
    messages: ClaudeMessage[]
  ): Promise<string> {
    const client = this.getClient();

    try {
      const response = await client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.3, // Lower temperature for extraction tasks
        system: systemPrompt,
        messages,
      });

      const textContent = response.content.find(c => c.type === 'text');
      return textContent && textContent.type === 'text' ? textContent.text : '';
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API error: ${error.message}`);
      }
      throw error;
    }
  }
}

// Singleton instance
let claudeClientInstance: ClaudeClient | null = null;

export function getClaudeClient(): ClaudeClient {
  if (!claudeClientInstance) {
    claudeClientInstance = new ClaudeClient();
  }
  return claudeClientInstance;
}
