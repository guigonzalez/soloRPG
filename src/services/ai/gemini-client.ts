import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ClaudeMessage } from '../../types/api';
import { getApiKey } from '../storage/api-key-storage';

/**
 * Gemini API client with streaming support
 */
export class GeminiClient {
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    this.model = 'gemini-3-flash-preview'; // Gemini 3 Flash Preview model
    this.maxTokens = 2000;
    this.temperature = 0.8;
  }

  /**
   * Create Google Generative AI client with current API key
   */
  private getClient(): GoogleGenerativeAI {
    const apiKey = getApiKey();

    if (!apiKey) {
      throw new Error('API key not configured. Please configure your API key in settings.');
    }

    return new GoogleGenerativeAI(apiKey);
  }

  /**
   * Convert Claude-style messages to Gemini format
   */
  private convertMessages(messages: ClaudeMessage[]): Array<{ role: string; parts: Array<{ text: string }> }> {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
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
    const model = client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        maxOutputTokens: this.maxTokens,
        temperature: this.temperature,
      },
      systemInstruction: systemPrompt,
    });

    try {
      // Convert messages to Gemini format
      const geminiMessages = this.convertMessages(messages);

      // Handle empty messages (campaign start)
      if (geminiMessages.length === 0) {
        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessageStream('Start the adventure.');

        let fullResponse = '';
        for await (const chunk of result.stream) {
          const text = chunk.text();
          fullResponse += text;
          onChunk(text);
        }
        return fullResponse;
      }

      // Start streaming chat
      const chat = model.startChat({
        history: geminiMessages.slice(0, -1), // All except last message
      });

      const lastMessage = geminiMessages[geminiMessages.length - 1];
      const result = await chat.sendMessageStream(lastMessage.parts[0].text);

      let fullResponse = '';

      for await (const chunk of result.stream) {
        const text = chunk.text();
        fullResponse += text;
        onChunk(text);
      }

      return fullResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
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
    const model = client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        maxOutputTokens: this.maxTokens,
        temperature: 0.3, // Lower temperature for extraction tasks
      },
      systemInstruction: systemPrompt,
    });

    try {
      // Convert messages to Gemini format
      let geminiMessages = this.convertMessages(messages);

      // Handle empty messages
      if (geminiMessages.length === 0) {
        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage('Start the adventure.');
        return result.response.text();
      }

      // Gemini requires first message to be 'user' role
      // If first message is 'model', prepend a user message
      if (geminiMessages[0].role !== 'user') {
        geminiMessages = [
          { role: 'user', parts: [{ text: 'Please analyze these messages.' }] },
          ...geminiMessages
        ];
      }

      // Ensure last message is 'user' for sendMessage call
      if (geminiMessages[geminiMessages.length - 1].role !== 'user') {
        geminiMessages.push({
          role: 'user',
          parts: [{ text: 'Please provide the analysis.' }]
        });
      }

      // Start chat
      const chat = model.startChat({
        history: geminiMessages.slice(0, -1), // All except last message
      });

      const lastMessage = geminiMessages[geminiMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts[0].text);

      return result.response.text();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw error;
    }
  }
}

// Singleton instance
let geminiClientInstance: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClientInstance) {
    geminiClientInstance = new GeminiClient();
  }
  return geminiClientInstance;
}
