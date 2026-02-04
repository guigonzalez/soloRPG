import { useChatStore } from '../store/chat-store';
import { rollDice } from '../services/dice/dice-roller';
import * as rollRepo from '../services/storage/roll-repo';
import type { NewRoll } from '../types/models';

/**
 * Hook to manage dice rolling
 */
export function useDiceRoll(campaignId: string | null) {
  const { pendingRollNotation, setPendingRoll } = useChatStore();

  /**
   * Execute a dice roll
   */
  const executeRoll = async (notation: string): Promise<number> => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    // Roll the dice
    const result = rollDice(notation);

    // Save to database
    const newRoll: NewRoll = {
      campaignId,
      notation: result.notation,
      result: result.total,
      breakdown: result.breakdown,
    };

    await rollRepo.createRoll(newRoll);

    // Clear pending roll
    setPendingRoll(null);

    return result.total;
  };

  /**
   * Request a roll (sets pending roll notation)
   */
  const requestRoll = (notation: string) => {
    setPendingRoll(notation);
  };

  /**
   * Cancel pending roll
   */
  const cancelRoll = () => {
    setPendingRoll(null);
  };

  return {
    pendingRollNotation,
    executeRoll,
    requestRoll,
    cancelRoll,
  };
}
