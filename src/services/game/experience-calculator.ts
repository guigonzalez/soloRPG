import type { SystemTemplate } from './attribute-templates';

/**
 * Result of an XP award
 */
export interface XPAward {
  amount: number;
  reason: string;
}

/**
 * Result of a level-up calculation
 */
export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  attributePoints: number;
}

/**
 * Calculate XP award based on roll result and difficulty
 *
 * @param rollResult - The total result of the roll
 * @param dc - The difficulty class (if any)
 * @param isNaturalCrit - Whether a natural 20 was rolled
 * @returns XP award or null if no XP should be awarded
 */
export function calculateRollXP(
  rollResult: number,
  dc: number | undefined,
  isNaturalCrit: boolean
): XPAward | null {
  // No XP for rolls without a difficulty class
  if (dc === undefined || dc === null) {
    return null;
  }

  // Failed roll - no XP
  if (rollResult < dc) {
    return null;
  }

  // Base XP based on difficulty
  let xp = 0;
  if (dc <= 10) {
    xp = 10; // Easy task
  } else if (dc <= 15) {
    xp = 25; // Medium task
  } else if (dc <= 20) {
    xp = 50; // Hard task
  } else {
    xp = 75; // Very hard task
  }

  // Bonus for critical success
  if (isNaturalCrit) {
    xp += 25;
  }

  // Build reason string
  const difficulty = dc <= 10 ? 'Easy' : dc <= 15 ? 'Medium' : dc <= 20 ? 'Hard' : 'Very Hard';
  const critBonus = isNaturalCrit ? ' - Critical!' : '';

  return {
    amount: xp,
    reason: `${difficulty} success (DC ${dc})${critBonus}`,
  };
}

/**
 * Calculate if character levels up and new level
 *
 * @param currentLevel - Character's current level
 * @param currentXP - Character's current XP
 * @param xpGain - Amount of XP to add
 * @param experienceTable - XP requirements for each level
 * @returns Level-up result with new level and attribute points
 */
export function calculateLevelUp(
  currentLevel: number,
  currentXP: number,
  xpGain: number,
  experienceTable: number[]
): LevelUpResult {
  const newXP = currentXP + xpGain;
  let newLevel = currentLevel;

  // Check if XP crosses one or more level thresholds
  while (newLevel < experienceTable.length && newXP >= experienceTable[newLevel]) {
    newLevel++;
  }

  const leveledUp = newLevel > currentLevel;
  const levelsGained = newLevel - currentLevel;

  return {
    leveledUp,
    newLevel,
    attributePoints: levelsGained, // 1 point per level gained
  };
}

/**
 * Get the XP required for the next level
 *
 * @param currentLevel - Character's current level
 * @param experienceTable - XP requirements for each level
 * @returns XP required for next level, or Infinity if at max level
 */
export function getNextLevelXP(currentLevel: number, experienceTable: number[]): number {
  if (currentLevel >= experienceTable.length) {
    return Infinity; // Max level reached
  }
  return experienceTable[currentLevel];
}

/**
 * Get XP progress percentage toward next level
 *
 * @param currentXP - Character's current XP
 * @param currentLevel - Character's current level
 * @param experienceTable - XP requirements for each level
 * @returns Progress percentage (0-100)
 */
export function getXPProgress(
  currentXP: number,
  currentLevel: number,
  experienceTable: number[]
): number {
  const nextLevelXP = getNextLevelXP(currentLevel, experienceTable);

  if (nextLevelXP === Infinity) {
    return 100; // Max level reached
  }

  const currentLevelXP = currentLevel > 0 ? experienceTable[currentLevel - 1] : 0;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const xpGainedTowardLevel = currentXP - currentLevelXP;

  return Math.min(100, Math.max(0, (xpGainedTowardLevel / xpNeededForLevel) * 100));
}

/**
 * Calculate attribute modifier (for systems like D&D that use modifiers)
 *
 * @param attributeValue - The attribute value
 * @param template - The system template
 * @returns Modifier value or undefined if system doesn't use modifiers
 */
export function getAttributeModifier(
  attributeValue: number,
  template: SystemTemplate
): number | undefined {
  if (!template.modifierCalculation) {
    return undefined;
  }
  return template.modifierCalculation(attributeValue);
}

/**
 * Format XP award message for chat display
 *
 * @param xpAward - The XP award to format
 * @returns Formatted message string
 */
export function formatXPAwardMessage(xpAward: XPAward): string {
  return `✨ +${xpAward.amount} XP - ${xpAward.reason}`;
}

/**
 * Format level-up message for chat display
 *
 * @param newLevel - The new level reached
 * @returns Formatted message string
 */
export function formatLevelUpMessage(newLevel: number): string {
  return `🎉 LEVEL UP! You are now Level ${newLevel}!`;
}
