import type { Message, SuggestedAction } from '../../types/models';
import type { ClaudeMessage } from '../../types/api';

/**
 * Assemble conversation context for Claude API
 * Takes recent messages and converts to Claude format
 */
export function assembleContext(messages: Message[]): ClaudeMessage[] {
  // Take last 20 messages for context (to stay within token limits)
  const recentMessages = messages.slice(-20);

  const claudeMessages: ClaudeMessage[] = [];

  for (const message of recentMessages) {
    // Skip system messages (they're not part of user/AI conversation)
    if (message.role === 'system') {
      continue;
    }

    // Convert to Claude format
    claudeMessages.push({
      role: message.role === 'user' ? 'user' : 'assistant',
      content: message.content,
    });
  }

  // Claude API requires messages to alternate user/assistant
  // and start with user message
  return ensureAlternatingMessages(claudeMessages);
}

/**
 * Ensure messages alternate between user and assistant
 * Claude API requirement
 */
function ensureAlternatingMessages(messages: ClaudeMessage[]): ClaudeMessage[] {
  if (messages.length === 0) {
    return [];
  }

  const result: ClaudeMessage[] = [];
  let lastRole: 'user' | 'assistant' | null = null;

  for (const message of messages) {
    // If same role as last message, merge them
    if (lastRole === message.role && result.length > 0) {
      const last = result[result.length - 1];
      last.content += '\n\n' + message.content;
    } else {
      result.push({ ...message });
      lastRole = message.role;
    }
  }

  // Ensure it starts with user message
  if (result.length > 0 && result[0].role !== 'user') {
    result.unshift({
      role: 'user',
      content: '[Conversation started]',
    });
  }

  return result;
}

/**
 * Parse roll request from AI response
 * Looks for patterns like "Roll to X. (DC: 15)" or "Roll d20" (English/Portuguese)
 */
export function parseRollRequest(content: string): string | null {
  // Pattern 1: "Roll to [action]. (DC: X)" or "role [dice] para [action]. (DC: X)"
  const dcPattern = /(Roll to [^.]+\.|role \d*d\d+ para [^.]+\.)\s*\(DC:\s*\d+\)/i;
  if (dcPattern.test(content)) {
    // Extract dice notation if present (e.g., "role 1d20 para")
    const diceMatch = content.match(/role\s+(\d*d\d+)/i);
    if (diceMatch) {
      return diceMatch[1];
    }
    return 'd20';
  }

  // Pattern 2: "Roll d20" or "Roll 1d20" or "role d20" or "role 1d20"
  const dicePattern = /(Roll|role)\s+(\d*d\d+(?:[+-]\d+)?)/i;
  const match = content.match(dicePattern);
  if (match) {
    return match[2];
  }

  // Pattern 3: Check if "roll"/"role" appears in last paragraph with DC mention
  const paragraphs = content.split('\n\n');
  const lastParagraph = paragraphs[paragraphs.length - 1] || '';

  if (/(roll|role)/i.test(lastParagraph) && /DC/i.test(lastParagraph)) {
    // Try to extract dice notation
    const diceMatch = lastParagraph.match(/(\d*d\d+)/i);
    if (diceMatch) {
      return diceMatch[1];
    }
    return 'd20';
  }

  return null;
}

/**
 * Parse suggested actions from AI response
 * Extracts action tags and returns clean content + actions
 */
export function parseSuggestedActions(content: string): {
  cleanContent: string;
  actions: SuggestedAction[];
} {
  const actions: SuggestedAction[] = [];

  // Match <actions>...</actions> block
  const actionsBlockMatch = content.match(/<actions>([\s\S]*?)<\/actions>/i);

  if (!actionsBlockMatch) {
    return { cleanContent: content, actions: [] };
  }

  const actionsBlock = actionsBlockMatch[1];

  // Extract individual <action> tags
  const actionRegex = /<action\s+id="([^"]+)"\s+label="([^"]+)"(?:\s+roll="([^"]+)")?(?:\s+dc="([^"]+)")?>([^<]+)<\/action>/gi;

  let match;
  while ((match = actionRegex.exec(actionsBlock)) !== null) {
    const [, id, label, roll, dc, action] = match;

    actions.push({
      id,
      label: label.trim(),
      action: action.trim(),
      rollNotation: roll?.trim(),
      dc: dc ? parseInt(dc, 10) : undefined,
    });
  }

  // Remove <actions> block from content
  const cleanContent = content.replace(/<actions>[\s\S]*?<\/actions>/i, '').trim();

  return { cleanContent, actions };
}
