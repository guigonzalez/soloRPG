import { parseDiceNotation, formatDiceNotation } from './dice-parser';
import type { DiceNotation, DiceRollResult } from '../../types/game';

/**
 * Roll a single die with given number of sides
 */
function rollSingleDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice and return all results
 */
function rollMultipleDice(count: number, sides: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollSingleDie(sides));
  }
  return results;
}

/**
 * Create a human-readable breakdown of the roll
 */
function createBreakdown(rolls: number[], modifier: number, total: number): string {
  const rollsStr = rolls.length === 1
    ? rolls[0].toString()
    : `[${rolls.join(', ')}]`;

  if (modifier === 0) {
    return `${rollsStr} = ${total}`;
  }

  const modStr = modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`;

  return `${rollsStr} ${modStr} = ${total}`;
}

/**
 * Roll dice from notation string
 */
export function rollDice(notation: string): DiceRollResult {
  const parsed = parseDiceNotation(notation);
  return rollDiceFromNotation(parsed);
}

/**
 * Roll dice from parsed notation
 */
export function rollDiceFromNotation(notation: DiceNotation): DiceRollResult {
  const { count, sides, modifier } = notation;

  // Roll all dice
  const rolls = rollMultipleDice(count, sides);

  // Calculate total
  const rollSum = rolls.reduce((sum, roll) => sum + roll, 0);
  const total = rollSum + modifier;

  // Create breakdown
  const breakdown = createBreakdown(rolls, modifier, total);

  return {
    notation: formatDiceNotation(notation),
    rolls,
    total,
    breakdown,
  };
}

/**
 * Roll with advantage (roll twice, take higher)
 * Used for d20 systems
 */
export function rollWithAdvantage(notation: string): DiceRollResult {
  const result1 = rollDice(notation);
  const result2 = rollDice(notation);

  if (result2.total > result1.total) {
    return {
      ...result2,
      breakdown: `${result1.breakdown} | ${result2.breakdown} (advantage)`,
    };
  }

  return {
    ...result1,
    breakdown: `${result1.breakdown} | ${result2.breakdown} (advantage)`,
  };
}

/**
 * Roll with disadvantage (roll twice, take lower)
 * Used for d20 systems
 */
export function rollWithDisadvantage(notation: string): DiceRollResult {
  const result1 = rollDice(notation);
  const result2 = rollDice(notation);

  if (result2.total < result1.total) {
    return {
      ...result2,
      breakdown: `${result1.breakdown} | ${result2.breakdown} (disadvantage)`,
    };
  }

  return {
    ...result1,
    breakdown: `${result1.breakdown} | ${result2.breakdown} (disadvantage)`,
  };
}
