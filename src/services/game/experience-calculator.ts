/**
 * Experience & Progression Calculator
 *
 * PHILOSOPHY: XP and levels are APP-OWNED, not system-specific.
 *
 * XP is awarded or penalized via <xp> tags from AI:
 * - Significant victories
 * - Quest completion
 * - Clever solutions
 *
 * XP is NOT awarded for:
 * - Every dice roll (removed calculateRollXP)
 * - Trivial actions
 *
 * This module uses the universal APP_XP_TABLE from sheet-presets.
 */

import { APP_XP_TABLE } from './sheet-presets';

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
  leveledDown: boolean;
  newLevel: number;
  attributePoints: number;
}

/**
 * Get character level from XP total
 */
export function getLevelFromXP(xp: number): number {
  const clamped = Math.max(0, xp);
  for (let i = APP_XP_TABLE.length - 1; i >= 0; i--) {
    if (clamped >= APP_XP_TABLE[i]) return i + 1;
  }
  return 1;
}

/**
 * Calculate level change from XP gain or loss
 *
 * @param currentLevel - Character's current level
 * @param currentXP - Character's current XP
 * @param xpChange - Amount to add (positive) or subtract (negative)
 * @returns Level-up/down result
 */
export function calculateLevelUp(
  currentLevel: number,
  currentXP: number,
  xpChange: number
): LevelUpResult {
  const newXP = Math.max(0, currentXP + xpChange);
  const newLevel = getLevelFromXP(newXP);

  const leveledUp = newLevel > currentLevel;
  const leveledDown = newLevel < currentLevel;
  const levelsGained = Math.max(0, newLevel - currentLevel);

  return {
    leveledUp,
    leveledDown,
    newLevel,
    attributePoints: levelsGained,
  };
}

/**
 * Get minimum XP required to be at a given level
 */
export function getMinXPForLevel(level: number): number {
  if (level <= 1) return 0;
  const idx = Math.min(level - 1, APP_XP_TABLE.length - 1);
  return APP_XP_TABLE[idx];
}

/**
 * Get the XP required for the next level
 *
 * @param currentLevel - Character's current level
 * @returns XP required for next level, or Infinity if at max level
 */
export function getNextLevelXP(currentLevel: number): number {
  if (currentLevel >= APP_XP_TABLE.length) {
    return Infinity; // Max level reached
  }
  return APP_XP_TABLE[currentLevel];
}

/**
 * Get XP progress percentage toward next level
 *
 * @param currentXP - Character's current XP
 * @param currentLevel - Character's current level
 * @returns Progress percentage (0-100)
 */
export function getXPProgress(currentXP: number, currentLevel: number): number {
  const nextLevelXP = getNextLevelXP(currentLevel);

  if (nextLevelXP === Infinity) {
    return 100; // Max level reached
  }

  const currentLevelXP = currentLevel > 0 ? APP_XP_TABLE[currentLevel - 1] : 0;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const xpGainedTowardLevel = currentXP - currentLevelXP;

  return Math.min(100, Math.max(0, (xpGainedTowardLevel / xpNeededForLevel) * 100));
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
