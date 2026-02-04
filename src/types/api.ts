/**
 * API and AI-related types
 */

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeStreamChunk {
  type: 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_start' | 'message_delta' | 'message_stop';
  delta?: {
    type: 'text_delta';
    text: string;
  };
}

export interface MemoryExtractionResult {
  recap: string;
  entities: Array<{
    name: string;
    type: string;
    blurb: string;
  }>;
  facts: Array<{
    subject: string;
    predicate: string;
    object: string;
    sourceMessageId: string;
  }>;
}

export interface AIResponse {
  content: string;
  needsRoll?: boolean;
  rollNotation?: string;
  rollDC?: number;
}
