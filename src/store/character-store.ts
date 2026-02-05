import { create } from 'zustand';
import type { Character, NewCharacter } from '../types/models';
import * as characterRepo from '../services/storage/character-repo';
import { calculateLevelUp, getLevelFromXP, getMinXPForLevel } from '../services/game/experience-calculator';
import { migrateLegacyAttributes, needsAttributeMigration } from '../services/game/universal-attributes';

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
  updateExperience: (xpGain: number, campaignSystem: string) => Promise<{ leveledUp: boolean; leveledDown: boolean; newLevel: number; attributePoints: number }>;
  incrementAttribute: (attributeName: string, incrementBy?: number) => Promise<void>;
  confirmLevelUp: () => void;
  clearCharacter: () => void;

  // HP management
  takeDamage: (damage: number) => Promise<void>;
  heal: (amount: number) => Promise<void>;
  fullRest: () => Promise<void>;

  // Inventory
  updateInventory: (inventory: import('../types/models').InventoryItem[]) => Promise<void>;
  useItem: (itemId: string) => Promise<boolean>; // Returns true if item was used

  // Equipment (weapon, armor)
  equipItem: (itemId: string, slot: 'weapon' | 'armor') => Promise<void>;
  unequipItem: (slot: 'weapon' | 'armor') => Promise<void>;
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  character: null,
  levelUpPending: false,
  attributePointsAvailable: 0,
  loading: false,
  error: null,

  /**
   * Load character for a campaign
   * Migrates legacy attributes to universal set if needed
   */
  loadCharacter: async (campaignId: string) => {
    set({ loading: true, error: null });
    try {
      let character = await characterRepo.getCharacterByCampaign(campaignId);

      if (character && needsAttributeMigration(character.attributes)) {
        const migratedAttributes = migrateLegacyAttributes(character.attributes);
        character = await characterRepo.updateCharacter(character.id, {
          attributes: migratedAttributes,
        });
      }

      // Migrate legacy characters: ensure inventory exists
      if (character && character.inventory === undefined) {
        character = await characterRepo.updateCharacter(character.id, { inventory: [] });
      }

      // Migrate legacy characters: remove old resources (sanity, blood points, magic points)
      const raw = character as unknown as Record<string, unknown>;
      if (character && (raw.resources || raw.maxResources)) {
        character = await characterRepo.removeLegacyResources(character.id);
      }

      // Migrate: fix experience for high-level characters created with 0 XP
      if (character && getLevelFromXP(character.experience) < character.level) {
        const correctXP = getMinXPForLevel(character.level);
        character = await characterRepo.updateCharacter(character.id, {
          experience: correctXP,
        });
      }

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
   *
   * NOTE: campaignSystem parameter kept for backward compatibility but not used.
   * XP progression now uses universal APP_XP_TABLE from sheet-presets.
   */
  updateExperience: async (xpGain: number, _campaignSystem: string) => {
    const { character } = get();
    if (!character) {
      throw new Error('No character loaded');
    }

    const levelUpResult = calculateLevelUp(
      character.level,
      character.experience,
      xpGain
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
   * Update character inventory
   */
  updateInventory: async (inventory: import('../types/models').InventoryItem[]) => {
    const { character } = get();
    if (!character) {
      throw new Error('No character loaded');
    }
    const updatedCharacter = await characterRepo.updateCharacter(character.id, { inventory });
    set({ character: updatedCharacter });
  },

  /**
   * Use a consumable item (e.g. healing potion)
   * Returns true if item was used successfully
   */
  useItem: async (itemId: string) => {
    const { character } = get();
    if (!character || !character.inventory) {
      return false;
    }
    const item = character.inventory.find((i) => i.id === itemId);
    if (!item || item.type !== 'consumable' || item.quantity < 1) {
      return false;
    }
    const { parseItemEffect } = await import('../services/game/inventory');
    const effect = parseItemEffect(item.effect || '');
    if (effect?.type === 'heal' && effect.value) {
      await get().heal(effect.value);
    }
    const newQuantity = item.quantity - 1;
    const newInventory = character.inventory
      .map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
      .filter((i) => i.quantity > 0);
    const updatedCharacter = await characterRepo.updateCharacter(character.id, { inventory: newInventory });
    set({ character: updatedCharacter });
    return true;
  },

  /**
   * Equip weapon or armor (itemId from definition)
   */
  equipItem: async (itemId: string, slot: 'weapon' | 'armor') => {
    const { character } = get();
    if (!character || !character.inventory) return;

    const hasItem = character.inventory.some((i) => i.itemId === itemId);
    if (!hasItem) return;

    const { getItemDefinition } = await import('../services/game/inventory');
    const def = getItemDefinition(itemId);
    if (!def?.equipmentSlot || def.equipmentSlot !== slot) return;

    const updates: Partial<Character> =
      slot === 'weapon' ? { equippedWeapon: itemId } : { equippedArmor: itemId };
    const updated = await characterRepo.updateCharacter(character.id, updates);
    set({ character: updated });
  },

  /**
   * Unequip weapon or armor
   */
  unequipItem: async (slot: 'weapon' | 'armor') => {
    const { character } = get();
    if (!character) return;

    const updates: Partial<Character> =
      slot === 'weapon' ? { equippedWeapon: undefined } : { equippedArmor: undefined };
    const updated = await characterRepo.updateCharacter(character.id, updates);
    set({ character: updated });
  },

  /**
   * Full rest - restore HP to max
   */
  fullRest: async () => {
    const { character } = get();
    if (!character) {
      throw new Error('No character loaded');
    }
    const updatedCharacter = await characterRepo.updateCharacterHP(
      character.id,
      character.maxHitPoints
    );
    set({ character: updatedCharacter });
  },
}));
