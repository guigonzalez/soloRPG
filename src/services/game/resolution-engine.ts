/**
 * Universal Resolution Engine
 *
 * This is the CORE mechanic of SoloRPG, independent of any specific RPG system.
 * All actions are resolved using this model, regardless of which sheet preset is chosen.
 */

export type ResolutionOutcome = 'critical_failure' | 'failure' | 'success' | 'critical_success';

export interface ResolutionResult {
  outcome: ResolutionOutcome;
  rollTotal: number;
  dc: number;
  margin: number;
  narrativeGuidance: string;
}

/**
 * Resolve an action using the universal d20 resolution model
 *
 * @param roll - The d20 roll result (1-20)
 * @param modifier - Total modifier from attributes/circumstances
 * @param dc - Difficulty Class (narrative risk level)
 * @param isNatural1 - Whether the d20 showed a 1
 * @param isNatural20 - Whether the d20 showed a 20
 */
export function resolveAction(
  roll: number,
  modifier: number,
  dc: number,
  isNatural1: boolean = roll === 1,
  isNatural20: boolean = roll === 20
): ResolutionResult {
  const total = roll + modifier;
  const margin = total - dc;

  let outcome: ResolutionOutcome;
  let guidance: string;

  // Critical Failure: Natural 1 OR fail by 10+
  if (isNatural1 || margin < -10) {
    outcome = 'critical_failure';
    guidance = 'Situation worsens significantly. Apply cost and complication.';
  }
  // Failure: Miss DC by 1-9
  else if (margin < 0) {
    outcome = 'failure';
    guidance = 'Objective not achieved. Apply narrative cost but advance the story.';
  }
  // Critical Success: Natural 20 OR succeed by 10+
  else if (isNatural20 || margin >= 10) {
    outcome = 'critical_success';
    guidance = 'Objective achieved with extra benefit or opportunity.';
  }
  // Success: Meet or beat DC
  else {
    outcome = 'success';
    guidance = 'Objective achieved as intended.';
  }

  return {
    outcome,
    rollTotal: total,
    dc,
    margin,
    narrativeGuidance: guidance,
  };
}

/**
 * Narrative Difficulty Guide
 *
 * These DCs represent NARRATIVE RISK, not official RPG system rules.
 * Use these to communicate how dangerous/difficult an action is in the fiction.
 */
export const NARRATIVE_DC_GUIDE = {
  10: 'Trivial under pressure',
  15: 'Common challenge',
  20: 'High risk',
  25: 'Extremely dangerous',
  30: 'Nearly suicidal',
} as const;

export type NarrativeDC = keyof typeof NARRATIVE_DC_GUIDE;

/**
 * Get narrative description for a given DC
 */
export function getNarrativeRisk(dc: number): string {
  // Find the closest DC in our guide
  const closestDC = Object.keys(NARRATIVE_DC_GUIDE)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - dc) < Math.abs(prev - dc) ? curr : prev
    ) as NarrativeDC;

  return NARRATIVE_DC_GUIDE[closestDC];
}

/**
 * Determine if a roll result warrants XP award (for UI display)
 * Note: XP comes from AI via <xp> tags (gain or loss per action),
 * but successful challenging rolls can award small amounts.
 */
export function shouldAwardRollXP(result: ResolutionResult): boolean {
  // Only award XP for successful challenging actions (DC 15+)
  return result.outcome === 'success' || result.outcome === 'critical_success';
}

/**
 * Calculate XP award for a successful roll (if applicable)
 * This is a MINIMAL reward - major XP should come from story milestones
 */
export function calculateRollXP(result: ResolutionResult): number {
  if (!shouldAwardRollXP(result)) {
    return 0;
  }

  const { dc, outcome } = result;

  // Base XP by difficulty
  let baseXP = 0;
  if (dc >= 25) baseXP = 50;      // Extremely dangerous
  else if (dc >= 20) baseXP = 25; // High risk
  else if (dc >= 15) baseXP = 10; // Common challenge
  else return 0;                   // No XP for trivial tasks

  // Bonus for critical success
  if (outcome === 'critical_success') {
    baseXP += 15;
  }

  return baseXP;
}
