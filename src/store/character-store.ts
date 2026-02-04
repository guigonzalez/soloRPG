import { create } from 'zustand';
import type { Character, NewCharacter } from '../types/models';
import * as characterRepo from '../services/storage/character-repo';
import { calculateLevelUp } from '../services/game/experience-calculator';
import { getSystemTemplate } from '../services/game/attribute-templates';

interface CharacterStore {
  character: Character | null;
  levelUpPending: boolean; // True when character leveled up and needs attribute allocation
  attributePointsAvailable: number; // Points to allocate on level up
  loading: boolean;
  error: string | null;

  // Actions
  loadCharacter: (campaignId: string) => Promise<void>;
  createCharacter: (data: NewCharacter) => Promise<Character>;
  setCharacter: (character: Character | null) => void;
  updateExperience: (xpGain: number, campaignSystem: string) => Promise<{ leveledUp: boolean; newLevel: number; attributePoints: number }>;
  incrementAttribute: (attributeName: string, incrementBy?: number) => Promise<void>;
  confirmLevelUp: () => void;
  clearCharacter: () => void;

  // HP and Resource management
  takeDamage: (damage: number) => Promise<void>;
  heal: (amount: number) => Promise<void>;
  updateResource: (resourceName: string, amount: number) => Promise<void>;
  restoreResource: (resourceName: string, amount: number) => Promise<void>;
  fullRest: () => Promise<void>; // Restore all HP and resources
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  character: null,
  levelUpPending: false,
  attributePointsAvailable: 0,
  loading: false,
  error: null,

  /**
   * Load character for a campaign
   */
  loadCharacter: async (campaignId: string) => {
    set({ loading: true, error: null });
    try {
      const character = await characterRepo.getCharacterByCampaign(campaignId);
      set({ character, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  /**
   * Create a new character
   */
  createCharacter: async (data: NewCharacter) => {
    set({ loading: true, error: null });
    try {
      const character = await characterRepo.createCharacter(data);
      set({ character, loading: false });
      return character;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  /**
   * Set character directly (for local updates)
   */
  setCharacter: (character: Character | null) => {
    set({ character });
  },

  /**
   * Update character experience and check for level-up
   * Returns level-up information
   */
  updateExperience: async (xpGain: number, campaignSystem: string) => {
    const { character } = get();
    if (!character) {
      throw new Error('No character loaded');
    }

    const template = getSystemTemplate(campaignSystem);
    const levelUpResult = calculateLevelUp(
      character.level,
      character.experience,
      xpGain,
      template.experienceTable
    );

    const newExperience = character.experience + xpGain;

    // Update character in database
    const updatedCharacter = await characterRepo.updateCharacterProgress(
      character.id,
      newExperience,
      levelUpResult.newLevel
    );

    set({ character: updatedCharacter });

    // If leveled up, set pending state
    if (levelUpResult.leveledUp) {
      set({
        levelUpPending: true,
        attributePointsAvailable: levelUpResult.attributePoints,
      });
    }

    return levelUpResult;
  },

  /**
   * Increment a character attribute
   */
  incrementAttribute: async (attributeName: string, incrementBy: number = 1) => {
    const { character, attributePointsAvailable } = get();
    if (!character) {
      throw new Error('No character loaded');
    }

    if (attributePointsAvailable <= 0) {
      throw new Error('No attribute points available');
    }

    // Update character attributes in database
    const updatedCharacter = await characterRepo.incrementCharacterAttribute(
      character.id,
      attributeName,
      incrementBy
    );

    set({
      character: updatedCharacter,
      attributePointsAvailable: attributePointsAvailable - incrementBy,
    });
  },

  /**
   * Confirm level-up (close modal and clear pending state)
   */
  confirmLevelUp: () => {
    set({
      levelUpPending: false,
      attributePointsAvailable: 0,
    });
  },

  /**
   * Clear character state
   */
  clearCharacter: () => {
    set({
      character: null,
      levelUpPending: false,
      attributePointsAvailable: 0,
      error: null,
    });
  },

  /**
   * Apply damage to character
   */
  takeDamage: async (damage: number) => {
    const { character } = get();
    if (!character) {
      throw new Error('No character loaded');
    }

    const newHP = Math.max(0, character.hitPoints - damage);
    const updatedCharacter = await characterRepo.updateCharacterHP(character.id, newHP);

    set({ character: updatedCharacter });
  },

  /**
   * Heal character
   */
  heal: async (amount: number) => {
    const { character } = get();
    if (!character) {
      throw new Error('No character loaded');
    }

    const newHP = Math.min(character.maxHitPoints, character.hitPoints + amount);
    const updatedCharacter = await characterRepo.updateCharacterHP(character.id, newHP);

    set({ character: updatedCharacter });
  },

  /**
   * Spend/use a resource
   */
  updateResource: async (resourceName: string, amount: number) => {
    const { character } = get();
    if (!character || !character.resources || !character.maxResources) {
      throw new Error('No character or resources available');
    }

    const currentValue = character.resources[resourceName] || 0;
    const maxValue = character.maxResources[resourceName] || 0;
    const newValue = Math.max(0, Math.min(maxValue, currentValue + amount));

    const updatedCharacter = await characterRepo.updateCharacterResource(
      character.id,
      resourceName,
      newValue
    );

    set({ character: updatedCharacter });
  },

  /**
   * Restore a resource (positive amount only)
   */
  restoreResource: async (resourceName: string, amount: number) => {
    const { character } = get();
    if (!character || !character.resources || !character.maxResources) {
      throw new Error('No character or resources available');
    }

    const currentValue = character.resources[resourceName] || 0;
    const maxValue = character.maxResources[resourceName] || 0;
    const newValue = Math.min(maxValue, currentValue + Math.abs(amount));

    const updatedCharacter = await characterRepo.updateCharacterResource(
      character.id,
      resourceName,
      newValue
    );

    set({ character: updatedCharacter });
  },

  /**
   * Full rest - restore all HP and resources
   */
  fullRest: async () => {
    const { character } = get();
    if (!character) {
      throw new Error('No character loaded');
    }

    // Restore HP to max
    let updatedCharacter = await characterRepo.updateCharacterHP(
      character.id,
      character.maxHitPoints
    );

    // Restore all resources to max
    if (character.maxResources) {
      for (const [resourceName, maxValue] of Object.entries(character.maxResources)) {
        updatedCharacter = await characterRepo.updateCharacterResource(
          character.id,
          resourceName,
          maxValue
        );
      }
    }

    set({ character: updatedCharacter });
  },
}));
