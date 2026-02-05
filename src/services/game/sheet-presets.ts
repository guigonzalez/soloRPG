/**
 * Sheet Presets - Character Sheet Templates
 *
 * PHILOSOPHY: Presets are SKINS, not RULES.
 *
 * A preset defines:
 * - Narrative flavor and consequence themes
 *
 * Attributes are UNIVERSAL and immutable (see universal-attributes.ts).
 * Presets do NOT define attributes.
 *
 * A preset does NOT define:
 * - Dice mechanics (always d20 + modifier vs DC)
 * - Resolution rules (universal resolution engine)
 * - Progression system (app-owned XP/levels)
 * - Official RPG rules
 */

import type { Character } from '../../types/models';
import {
  UNIVERSAL_ATTRIBUTES,
  UNIVERSAL_MODIFIER_CALC,
  UNIVERSAL_POINT_BUY,
  type AttributeDefinition,
} from './universal-attributes';

export type { AttributeDefinition };

/**
 * Consequence themes that guide narrative outcomes
 */
export interface ConsequenceTheme {
  type: 'physical' | 'mental' | 'social' | 'resource' | 'environmental';
  examples: string[]; // Example consequences for this theme
}

/**
 * Point-buy configuration for character creation
 */
export interface PointBuyConfig {
  totalPoints: number; // Total points available
  calculateCost: (value: number, defaultValue: number) => number; // Cost function
}

/**
 * Sheet Preset Template
 *
 * This defines a character sheet layout and narrative flavor,
 * NOT a simulation of official RPG mechanics.
 */
export interface SheetPreset {
  // Identity
  presetId: string; // Unique ID (e.g., 'dnd-fantasy', 'cosmic-horror')
  displayName: string; // Name shown to user
  narrativeFlavor: string; // Description of tone/theme this preset brings

  // Character sheet structure (always universal 4 attributes)
  attributes: readonly AttributeDefinition[];

  // Character creation
  pointBuy?: PointBuyConfig;

  // Progression (app-owned, but preset-influenced)
  levelUpPoints: number; // Attribute points per level

  // HP calculation (all presets use HP, but formula varies)
  calculateMaxHP: (character: Character, level: number) => number;

  // Narrative guidance
  consequenceThemes: ConsequenceTheme[];

  // Optional: modifier display (for D&D-like presets)
  modifierCalculation?: (value: number) => number;
}

/**
 * APP-OWNED PROGRESSION TABLE
 *
 * This XP table is used for ALL presets.
 * Levels are NOT system-specific (no "D&D levels" vs "CoC investigator ranks").
 */
export const APP_XP_TABLE = [
  0,       // Level 1
  600,     // Level 2
  1800,    // Level 3
  4200,    // Level 4
  8400,    // Level 5
  15000,   // Level 6
  24000,   // Level 7
  35000,   // Level 8
  48000,   // Level 9
  64000,   // Level 10
  84000,   // Level 11
  108000,  // Level 12
  136000,  // Level 13
  168000,  // Level 14
  204000,  // Level 15
  244000,  // Level 16
  288000,  // Level 17
  336000,  // Level 18
  388000,  // Level 19
  444000,  // Level 20
];

/**
 * All available sheet presets
 */
export const SHEET_PRESETS: Record<string, SheetPreset> = {
  /**
   * D&D-STYLE FANTASY
   * Classic fantasy attributes, dungeon crawling, magic and monsters
   */
  'dnd-fantasy': {
    presetId: 'dnd-fantasy',
    displayName: 'D&D-Style Fantasy',
    narrativeFlavor: 'Classic fantasy adventures with dungeons, magic, and heroic deeds. Attributes represent physical and mental capabilities.',

    attributes: UNIVERSAL_ATTRIBUTES,
    pointBuy: UNIVERSAL_POINT_BUY,
    modifierCalculation: UNIVERSAL_MODIFIER_CALC,
    levelUpPoints: 2,

    calculateMaxHP: (_character, level) => {
      const baseHP = 10;
      return baseHP + (level - 1) * 5;
    },

    consequenceThemes: [
      { type: 'physical', examples: ['HP damage', 'exhaustion', 'wounded', 'bleeding'] },
      { type: 'environmental', examples: ['enemies alerted', 'trap triggered', 'time pressure', 'noise attracts danger'] },
      { type: 'resource', examples: ['equipment damaged', 'supplies lost', 'weapon breaks'] },
      { type: 'social', examples: ['reputation damage', 'NPC distrust', 'bounty placed'] },
    ],
  },

  /**
   * COSMIC HORROR
   * Lovecraftian investigation, forbidden knowledge
   */
  'cosmic-horror': {
    presetId: 'cosmic-horror',
    displayName: 'Cosmic Horror',
    narrativeFlavor: 'Investigation into the unknown. Face eldritch horrors beyond human comprehension.',

    attributes: UNIVERSAL_ATTRIBUTES,
    pointBuy: UNIVERSAL_POINT_BUY,
    modifierCalculation: UNIVERSAL_MODIFIER_CALC,
    levelUpPoints: 2,

    calculateMaxHP: (_character, level) => {
      const baseHP = 10;
      return baseHP + (level - 1) * 5;
    },

    consequenceThemes: [
      { type: 'mental', examples: ['paranoia', 'nightmares', 'phobias', 'delusions'] },
      { type: 'social', examples: ['marked as mad', 'isolation', 'distrust from community'] },
      { type: 'resource', examples: ['forbidden tome damaged', 'ritual components lost'] },
      { type: 'environmental', examples: ['cultists alerted', 'entity awakens', 'reality warps'] },
    ],
  },

  /**
   * DARK FUTURE (Cyberpunk)
   * High-tech, low-life. Corporate dystopia, street skills, cyberware
   */
  'dark-future': {
    presetId: 'dark-future',
    displayName: 'Dark Future',
    narrativeFlavor: 'Cyberpunk dystopia where technology and humanity collide. Street-level survival in a corporate-controlled world.',

    attributes: UNIVERSAL_ATTRIBUTES,
    pointBuy: UNIVERSAL_POINT_BUY,
    modifierCalculation: UNIVERSAL_MODIFIER_CALC,
    levelUpPoints: 2,

    calculateMaxHP: (_character, level) => {
      const baseHP = 10;
      return baseHP + (level - 1) * 5;
    },

    consequenceThemes: [
      { type: 'social', examples: ['Heat gained', 'corporate attention', 'street cred loss', 'wanted by gangs'] },
      { type: 'physical', examples: ['cyberware malfunction', 'injuries', 'chrome rejection', 'bleeding out'] },
      { type: 'resource', examples: ['eddies lost', 'ammo depleted', 'gear fried', 'contacts burned'] },
      { type: 'environmental', examples: ['security alerted', 'netrunners trace you', 'NCPD incoming'] },
    ],
  },

  /**
   * GOTHIC VAMPIRE
   * Personal horror, political intrigue
   */
  'gothic-vampire': {
    presetId: 'gothic-vampire',
    displayName: 'Gothic Vampire',
    narrativeFlavor: 'Undead existence balancing humanity and the Beast. Political intrigue among immortals in a world of darkness.',

    attributes: UNIVERSAL_ATTRIBUTES,
    pointBuy: UNIVERSAL_POINT_BUY,
    modifierCalculation: UNIVERSAL_MODIFIER_CALC,
    levelUpPoints: 2,

    calculateMaxHP: (_character, level) => {
      const baseHP = 10;
      return baseHP + (level - 1) * 5;
    },

    consequenceThemes: [
      { type: 'resource', examples: ['hunger increases', 'vitality depleted'] },
      { type: 'social', examples: ['Masquerade breach', 'lost standing', 'marked by Prince', 'domain violated'] },
      { type: 'mental', examples: ['Beast stirs', 'frenzy risk', 'humanity loss', 'guilt and remorse'] },
      { type: 'physical', examples: ['torpor risk', 'damaged', 'staked', 'burned'] },
    ],
  },

  /**
   * GENERIC
   * Flexible, narrative-first. Minimal mechanical assumptions.
   */
  'generic': {
    presetId: 'generic',
    displayName: 'Generic Adventure',
    narrativeFlavor: 'Flexible narrative experience with simple attributes. Adapt to any story or genre.',

    attributes: UNIVERSAL_ATTRIBUTES,
    pointBuy: UNIVERSAL_POINT_BUY,
    modifierCalculation: UNIVERSAL_MODIFIER_CALC,
    levelUpPoints: 2,

    calculateMaxHP: (_character, level) => {
      const baseHP = 10;
      return baseHP + (level - 1) * 5;
    },

    consequenceThemes: [
      { type: 'physical', examples: ['HP damage', 'wounded', 'exhausted'] },
      { type: 'mental', examples: ['stressed', 'confused', 'demoralized'] },
      { type: 'social', examples: ['reputation damaged', 'trust lost', 'conflict escalates'] },
      { type: 'environmental', examples: ['situation worsens', 'time pressure', 'danger attracts attention'] },
    ],
  },
};

/**
 * Get a sheet preset by ID or legacy system name
 * Uses migrateSystemToPreset so "D&D 5e" -> dnd-fantasy, "Generic/Freeform" -> generic, etc.
 */
export function getSheetPreset(presetId: string): SheetPreset {
  const resolvedId = migrateSystemToPreset(presetId);
  return SHEET_PRESETS[resolvedId] || SHEET_PRESETS['generic'];
}

/**
 * Get all available presets
 */
export function getAllPresets(): SheetPreset[] {
  return Object.values(SHEET_PRESETS);
}

/**
 * Create a new character with default values from a preset
 */
export function createCharacterFromPreset(
  campaignId: string,
  presetId: string,
  name?: string
): Omit<Character, 'id' | 'createdAt' | 'updatedAt'> {
  const preset = getSheetPreset(presetId);

  // Initialize attributes with default values
  const attributes: Record<string, number> = {};
  preset.attributes.forEach(attr => {
    attributes[attr.name] = attr.defaultValue;
  });

  // Calculate initial HP
  const maxHitPoints = preset.calculateMaxHP({ attributes } as Character, 1);

  return {
    campaignId,
    name: name || 'Adventurer',
    level: 1,
    experience: 0,
    hitPoints: maxHitPoints,
    maxHitPoints,
    attributes,
  };
}

/**
 * Helper functions for point-buy validation
 */
export function calculateTotalPointCost(
  attributes: Record<string, number>,
  preset: SheetPreset
): number {
  if (!preset.pointBuy) return 0;

  return preset.attributes.reduce((total, attrDef) => {
    const value = attributes[attrDef.name] || attrDef.defaultValue;
    return total + preset.pointBuy!.calculateCost(value, attrDef.defaultValue);
  }, 0);
}

export function isValidAttributeChange(
  attributes: Record<string, number>,
  attributeName: string,
  newValue: number,
  preset: SheetPreset
): boolean {
  const attrDef = preset.attributes.find(a => a.name === attributeName);
  if (!attrDef) return false;

  // Check bounds
  if (newValue < attrDef.minValue || newValue > attrDef.maxValue) {
    return false;
  }

  // Check point-buy cost
  if (preset.pointBuy) {
    const testAttributes = { ...attributes, [attributeName]: newValue };
    const totalCost = calculateTotalPointCost(testAttributes, preset);
    return totalCost <= preset.pointBuy.totalPoints;
  }

  return true;
}

/**
 * Migration: Map old system names to new preset IDs
 */
export const LEGACY_SYSTEM_TO_PRESET_MAP: Record<string, string> = {
  'D&D 5e': 'dnd-fantasy',
  'Pathfinder 2e': 'dnd-fantasy',
  'Call of Cthulhu': 'cosmic-horror',
  'Cyberpunk RED': 'dark-future',
  'Vampire: The Masquerade': 'gothic-vampire',
  'Fate Core': 'generic',
  'Powered by the Apocalypse': 'generic',
  'OSR (Old School Renaissance)': 'generic',
  'Generic/Freeform': 'generic',
  'Generic': 'generic',
  'Other': 'generic',
};

export function migrateSystemToPreset(oldSystem: string): string {
  return LEGACY_SYSTEM_TO_PRESET_MAP[oldSystem] || 'generic';
}
