/**
 * Game-specific types
 */

export interface DiceNotation {
  count: number; // Number of dice
  sides: number; // Sides per die
  modifier: number; // Modifier to add to the result
}

export interface DiceRollResult {
  notation: string;
  rolls: number[]; // Individual dice results
  total: number; // Final result with modifier
  breakdown: string; // Human-readable breakdown
}

export interface GameContext {
  campaignId: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  recap?: string;
  entities: Array<{
    name: string;
    type: string;
    blurb: string;
  }>;
  facts: Array<{
    subject: string;
    predicate: string;
    object: string;
  }>;
}
