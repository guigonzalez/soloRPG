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
      // Import getSystemTemplate to calculate HP
      const { getSystemTemplate } = await import('../services/game/attribute-templates');
      const template = getSystemTemplate(_campaignSystem);

      // Create temp character object to calculate HP
      const tempChar = {
        id: '',
        campaignId,
        name,
        level: 1,
        experience: 0,
        attributes,
        hitPoints: 0,
        maxHitPoints: 0,
        createdAt: 0,
        updatedAt: 0,
      };

      // Calculate HP and resources
      const maxHP = template.calculateMaxHP(tempChar, 1);
      let resources: Record<string, number> | undefined;
      let maxResources: Record<string, number> | undefined;

      if (template.resources && template.calculateMaxResources) {
        maxResources = template.calculateMaxResources(tempChar, 1);
        resources = { ...maxResources };
      }

      const newCharacter = await createCharacter({
        campaignId,
        name,
        level: 1,
        experience: 0,
        attributes,
        hitPoints: maxHP,
        maxHitPoints: maxHP,
        resources,
        maxResources,
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
