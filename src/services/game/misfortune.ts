/**
 * Misfortune (Amarra) - Anti-cheat binding
 *
 * When the player claims a dice result in their message (e.g. "I rolled 20", "tirei 20")
 * instead of using the system's roll, they gain misfortune.
 *
 * - Does NOT prevent the action
 * - Applies "bad luck" penalty to future rolls
 * - AI depreciates any claimed results in narrative
 * - Decays with honest rolls
 */

export const MISFORTUNE_MAX = 5;
export const MISFORTUNE_PENALTY_PER_STACK = 1;
export const MISFORTUNE_DECAY_PER_HONEST_ROLL = 1;

/**
 * Patterns for claimed roll detection (multiple languages)
 * Matches: "tirei 20", "rolled 20", "natural 20", "dado 20", "rolei 20", etc.
 */
const CLAIMED_ROLL_PATTERNS = [
  // Portuguese
  /\b(?:tirei|rolei|rolou|rolamos)\s*(?:um?\s*)?(\d{1,2})\b/i,
  /\b(?:dado|dados?)\s*(?:deu|deu\s+em|resultou\s+em)?\s*(\d{1,2})\b/i,
  /\b(?:natural\s+)?(\d{1,2})\s*(?:no\s+dado|nos\s+dados)\b/i,
  // English
  /\b(?:rolled|rolled\s+a|got|got\s+a)\s*(?:natural\s+)?(\d{1,2})\b/i,
  /\b(?:natural\s+)?(\d{1,2})\s*(?:on\s+the\s+die|on\s+dice)\b/i,
  /\b(?:the\s+die\s+showed|dice\s+showed)\s*(\d{1,2})\b/i,
  // Spanish
  /\b(?:tir[eé]|saqu[eé]|sali[oó])\s*(?:un?\s*)?(\d{1,2})\b/i,
  /\b(?:dado|dados?)\s*(?:sali[oó]|dio)\s*(\d{1,2})\b/i,
];

/**
 * Detect if the message claims a dice roll result
 * Returns the claimed value if detected (for AI context), or null
 */
export function detectClaimedRoll(message: string): number | null {
  const trimmed = message.trim();
  if (trimmed.length < 5) return null;

  for (const pattern of CLAIMED_ROLL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (value >= 1 && value <= 20) {
        return value;
      }
    }
  }

  return null;
}

/**
 * Calculate penalty to apply to a roll result based on misfortune
 */
export function getMisfortunePenalty(misfortune: number): number {
  if (misfortune <= 0) return 0;
  const stacks = Math.min(misfortune, MISFORTUNE_MAX);
  return stacks * MISFORTUNE_PENALTY_PER_STACK;
}

/**
 * Apply misfortune penalty to a roll total
 * Returns the effective result to pass to AI (depreciated)
 */
export function applyMisfortuneToRoll(rollTotal: number, misfortune: number): number {
  const penalty = getMisfortunePenalty(misfortune);
  return Math.max(1, rollTotal - penalty);
}

/**
 * Get the effective roll to show in narrative when misfortune is active
 * E.g. "Rolled 18 (misfortune -2 → 16)"
 */
export function getMisfortuneRollBreakdown(
  rollTotal: number,
  breakdown: string,
  misfortune: number
): string {
  const penalty = getMisfortunePenalty(misfortune);
  if (penalty <= 0) return breakdown;
  const effective = Math.max(1, rollTotal - penalty);
  return `${breakdown} [misfortune: ${effective}]`;
}
