/**
 * Core data models for SoloRPG
 */

export interface Campaign {
  id: string;
  title: string;
  system: string; // RPG system (D&D 5e, Call of Cthulhu, etc.)
  theme: string;
  tone: string;
  createdAt: number;
  updatedAt: number;
}

export type MessageRole = 'user' | 'ai' | 'system';

export interface Message {
  id: string;
  campaignId: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface Recap {
  campaignId: string;
  summaryShort: string; // Max 600 characters
  updatedAt: number;
}

export type EntityType = 'character' | 'npc' | 'place' | 'item' | 'faction' | 'other';

export interface Entity {
  id: string;
  campaignId: string;
  name: string;
  type: EntityType;
  blurb: string; // One-line description
  lastSeenAt: number;
}

export interface Fact {
  id: string;
  campaignId: string;
  subjectEntityId?: string; // Optional reference to entity
  predicate: string; // The relationship or action
  object: string; // What the predicate applies to
  sourceMessageId: string; // Required: which message this fact came from
  createdAt: number;
}

export interface Roll {
  id: string;
  campaignId: string;
  notation: string; // e.g., "1d20+2", "2d6"
  result: number;
  breakdown: string; // e.g., "[15] + 2 = 17"
  createdAt: number;
}

/**
 * Suggested action that the AI presents to the player
 */
export interface SuggestedAction {
  id: string; // Unique ID for this action
  label: string; // Button text (e.g., "Attack the guard")
  action: string; // Full action text to send (e.g., "I attack the guard with my sword")
  rollNotation?: string; // Optional dice notation if action requires a roll (e.g., "1d20+3")
  dc?: number; // Optional difficulty class for the roll
}

/**
 * Player character with attributes and progression
 */
export interface Character {
  id: string;
  campaignId: string; // One character per campaign
  name: string;
  level: number; // Current level (starts at 1)
  experience: number; // Current XP
  attributes: Record<string, number>; // Dynamic attributes based on system
  // Example D&D: { strength: 10, dexterity: 12, constitution: 11, intelligence: 16, wisdom: 13, charisma: 8 }
  // Example CoC: { STR: 55, DEX: 60, INT: 70, CON: 50, SIZ: 65, APP: 50, POW: 60, EDU: 65 }

  // Health
  hitPoints: number; // Current HP
  maxHitPoints: number; // Maximum HP

  // Character Background and Personality
  backstory?: string; // Character's background story
  personality?: string; // Personality traits (e.g., "brave, curious, reckless")
  goals?: string; // Character's goals and motivations
  fears?: string; // Character's fears or weaknesses

  // Misfortune (Amarra) - bad luck stacks from claiming roll results in text
  misfortune?: number; // 0-5, penalizes future rolls, decays on honest rolls

  // Inventory - items from creation + drops during gameplay
  inventory?: InventoryItem[];

  // Equipped weapon/armor (itemId from definitions)
  equippedWeapon?: string;
  equippedArmor?: string;

  createdAt: number;
  updatedAt: number;
}

/**
 * Item in character inventory
 */
export type ItemType = 'consumable' | 'equipment' | 'other';

export interface InventoryItem {
  id: string;
  itemId: string; // Reference to item definition (e.g. 'healing_potion')
  name: string;
  type: ItemType;
  quantity: number; // For consumables; equipment is 1
  /** Effect when used: heal:X, roll_bonus:X, modifier:attr:X */
  effect?: string;
  description?: string;
}

// Helper types for creation (without generated fields)
export type NewCampaign = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>;
export type NewMessage = Omit<Message, 'id' | 'createdAt'>;
export type NewEntity = Omit<Entity, 'id' | 'lastSeenAt'>;
export type NewFact = Omit<Fact, 'id' | 'createdAt'>;
export type NewRoll = Omit<Roll, 'id' | 'createdAt'>;
export type NewCharacter = Omit<Character, 'id' | 'createdAt' | 'updatedAt'>;
