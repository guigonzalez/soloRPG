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

// Helper types for creation (without generated fields)
export type NewCampaign = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>;
export type NewMessage = Omit<Message, 'id' | 'createdAt'>;
export type NewEntity = Omit<Entity, 'id' | 'lastSeenAt'>;
export type NewFact = Omit<Fact, 'id' | 'createdAt'>;
export type NewRoll = Omit<Roll, 'id' | 'createdAt'>;
