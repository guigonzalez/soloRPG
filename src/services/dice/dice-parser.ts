import type { DiceNotation } from '../../types/game';

/**
 * Parse dice notation strings into structured format
 * Supports: d20, 1d20, 2d6, 2d6+3, d20-2, etc.
 */
export function parseDiceNotation(notation: string): DiceNotation {
  const trimmed = notation.trim().toLowerCase();

  // Pattern: [count]d[sides][+/-modifier]
  // Examples: d20, 1d20, 2d6+3, d20-2
  const pattern = /^(\d*)d(\d+)([+-]\d+)?$/;
  const match = trimmed.match(pattern);

  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}. Use format like "d20", "2d6", or "2d6+3"`);
  }

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const modifierStr = match[3] || '+0';
  const modifier = parseInt(modifierStr, 10);

  // Validation
  if (count < 1 || count > 100) {
    throw new Error('Dice count must be between 1 and 100');
  }

  if (sides < 2 || sides > 1000) {
    throw new Error('Dice sides must be between 2 and 1000');
  }

  if (modifier < -100 || modifier > 100) {
    throw new Error('Modifier must be between -100 and +100');
  }

  return { count, sides, modifier };
}

/**
 * Validate dice notation string
 */
export function isValidDiceNotation(notation: string): boolean {
  try {
    parseDiceNotation(notation);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format dice notation for display
 */
export function formatDiceNotation(notation: DiceNotation): string {
  const { count, sides, modifier } = notation;
  const countStr = count === 1 ? '' : count.toString();
  const modStr = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : modifier.toString();
  return `${countStr}d${sides}${modStr}`;
}
