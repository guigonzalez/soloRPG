import { useEffect } from 'react';
import { useCharacterStore } from '../store/character-store';

/**
 * Hook to manage character lifecycle for a campaign
 * Handles loading, creating, and migrating characters
 */
export function useCharacter(campaignId: string | null, _campaignSystem: string) {
  const { character, loadCharacter, createCharacter, clearCharacter } = useCharacterStore();

  useEffect(() => {
    if (!campaignId) {
      clearCharacter();
      return;
    }

    // Load or create character for this campaign
    loadOrCreateCharacter(campaignId);

    return () => {
      // Cleanup on unmount
      clearCharacter();
    };
  }, [campaignId, loadCharacter, clearCharacter]);

  /**
   * Load existing character or flag that one needs to be created
   */
  async function loadOrCreateCharacter(campaignId: string) {
    try {
      await loadCharacter(campaignId);
    } catch (error) {
      console.error('Error loading character:', error);
    }
  }

  /**
   * Create a new character for the campaign
   */
  async function handleCreateCharacter(name: string, attributes: Record<string, number>) {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    try {
      const newCharacter = await createCharacter({
        campaignId,
        name,
        level: 1,
        experience: 0,
        attributes,
      });

      return newCharacter;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  /**
   * Check if character needs to be created
   */
  const needsCharacterCreation = campaignId && !character;

  return {
    character,
    needsCharacterCreation,
    handleCreateCharacter,
  };
}
