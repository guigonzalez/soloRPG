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
 * Parse XP award from AI response
 * Extracts <xp_award> tags and returns XP amount + clean content
 */
export function parseXPAward(content: string): {
  cleanContent: string;
  xpAmount: number | null;
} {
  // Match <xp_award>X</xp_award> tag
  const xpMatch = content.match(/<xp_award>(\d+)<\/xp_award>/i);

  if (!xpMatch) {
    return { cleanContent: content, xpAmount: null };
  }

  const xpAmount = parseInt(xpMatch[1], 10);

  // Remove <xp_award> tag from content
  const cleanContent = content.replace(/<xp_award>\d+<\/xp_award>/gi, '').trim();

  return { cleanContent, xpAmount };
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

/**
 * HP/Resource effect interface
 */
export interface CharacterEffect {
  type: 'damage' | 'heal' | 'spend_resource' | 'restore_resource';
  amount: number;
  resourceName?: string; // For resource effects
}

/**
 * Parse character effects from AI response
 * Extracts HP damage/healing and resource management tags
 *
 * Supported tags:
 * - <damage>X</damage> - Apply X damage to character
 * - <heal>X</heal> - Restore X HP to character
 * - <spend_resource name="Sanity">X</spend_resource> - Spend X of resource
 * - <restore_resource name="Magic Points">X</restore_resource> - Restore X of resource
 */
export function parseCharacterEffects(content: string): {
  cleanContent: string;
  effects: CharacterEffect[];
} {
  const effects: CharacterEffect[] = [];
  let cleanContent = content;

  // Parse <damage>X</damage>
  const damageRegex = /<damage>(\d+)<\/damage>/gi;
  let damageMatch;
  while ((damageMatch = damageRegex.exec(content)) !== null) {
    effects.push({
      type: 'damage',
      amount: parseInt(damageMatch[1], 10),
    });
  }
  cleanContent = cleanContent.replace(damageRegex, '').trim();

  // Parse <heal>X</heal>
  const healRegex = /<heal>(\d+)<\/heal>/gi;
  let healMatch;
  while ((healMatch = healRegex.exec(content)) !== null) {
    effects.push({
      type: 'heal',
      amount: parseInt(healMatch[1], 10),
    });
  }
  cleanContent = cleanContent.replace(healRegex, '').trim();

  // Parse <spend_resource name="ResourceName">X</spend_resource>
  const spendResourceRegex = /<spend_resource\s+name="([^"]+)">(\d+)<\/spend_resource>/gi;
  let spendMatch;
  while ((spendMatch = spendResourceRegex.exec(content)) !== null) {
    effects.push({
      type: 'spend_resource',
      amount: -parseInt(spendMatch[2], 10), // Negative for spending
      resourceName: spendMatch[1],
    });
  }
  cleanContent = cleanContent.replace(spendResourceRegex, '').trim();

  // Parse <restore_resource name="ResourceName">X</restore_resource>
  const restoreResourceRegex = /<restore_resource\s+name="([^"]+)">(\d+)<\/restore_resource>/gi;
  let restoreMatch;
  while ((restoreMatch = restoreResourceRegex.exec(content)) !== null) {
    effects.push({
      type: 'restore_resource',
      amount: parseInt(restoreMatch[2], 10),
      resourceName: restoreMatch[1],
    });
  }
  cleanContent = cleanContent.replace(restoreResourceRegex, '').trim();

  return { cleanContent, effects };
}
