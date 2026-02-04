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
}));
