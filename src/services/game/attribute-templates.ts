import { ulid } from 'ulid';
import type { Character } from '../../types/models';

/**
 * Definition of a single attribute for an RPG system
 */
export interface AttributeDefinition {
  name: string; // Internal name (e.g., 'strength', 'STR')
  displayName: string; // Display name (e.g., 'STR', 'Strength')
  description: string; // What this attribute represents
  defaultValue: number; // Starting value
  minValue: number; // Minimum allowed value
  maxValue: number; // Maximum allowed value
}

/**
 * Definition of a system-specific resource (HP, Sanity, etc.)
 */
export interface ResourceDefinition {
  name: string; // Internal name (e.g., 'sanity', 'magicPoints')
  displayName: string; // Display name (e.g., 'Sanity', 'MP')
  description: string; // What this resource represents
  color?: string; // Display color (e.g., '#9cd84e' for HP, '#6495ed' for Sanity)
}

/**
 * Point-buy configuration for character creation
 */
export interface PointBuyConfig {
  totalPoints: number; // Total points available for distribution
  calculateCost: (value: number, defaultValue: number) => number; // Cost function for each point
}

/**
 * Complete template for an RPG system
 */
export interface SystemTemplate {
  systemName: string;
  attributes: AttributeDefinition[];
  modifierCalculation?: (value: number) => number; // For D&D-style modifiers
  levelUpPoints: number; // Attribute points gained per level
  experienceTable: number[]; // XP required for each level (moderate progression)

  // Point-buy system for character creation
  pointBuy?: PointBuyConfig;

  // HP calculation
  calculateMaxHP: (character: Character, level: number) => number;

  // Additional resources (e.g., Sanity for CoC, Magic Points)
  resources?: ResourceDefinition[];
  calculateMaxResources?: (character: Character, level: number) => Record<string, number>;
}

/**
 * Attribute templates for all supported RPG systems
 */
export const attributeTemplates: Record<string, SystemTemplate> = {
  'D&D 5e': {
    systemName: 'D&D 5e',
    attributes: [
      {
        name: 'strength',
        displayName: 'STR',
        description: 'Physical power and athletic ability',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
      {
        name: 'dexterity',
        displayName: 'DEX',
        description: 'Agility, reflexes, and balance',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
      {
        name: 'constitution',
        displayName: 'CON',
        description: 'Health, stamina, and vital force',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
      {
        name: 'intelligence',
        displayName: 'INT',
        description: 'Reasoning, memory, and analytical skill',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
      {
        name: 'wisdom',
        displayName: 'WIS',
        description: 'Awareness, intuition, and insight',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
      {
        name: 'charisma',
        displayName: 'CHA',
        description: 'Force of personality and leadership',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
    ],
    modifierCalculation: (value) => Math.floor((value - 10) / 2),
    levelUpPoints: 1, // 1 attribute point every 4 levels (simplified)
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],

    // Point-buy system: 27 points (standard array equivalent)
    pointBuy: {
      totalPoints: 27,
      calculateCost: (value, _defaultValue) => {
        // D&D 5e point-buy costs
        if (value <= 8) return 0;
        if (value === 9) return 1;
        if (value === 10) return 2;
        if (value === 11) return 3;
        if (value === 12) return 4;
        if (value === 13) return 5;
        if (value === 14) return 7;
        if (value === 15) return 9;
        return 0; // Invalid values
      },
    },

    // HP calculation: 10 + CON modifier per level (average d8 hit die, like Fighter/Cleric)
    // Level 1 gets max hit die (10) + CON mod
    // Each additional level gets average (5) + CON mod
    calculateMaxHP: (character, level) => {
      const conMod = Math.floor((character.attributes.constitution - 10) / 2);
      // Ensure minimum of 1 HP per level
      const hpPerLevel = Math.max(1, 5 + conMod);
      const baseHP = Math.max(1, 10 + conMod);

      if (level === 1) {
        return baseHP;
      }
      return baseHP + (level - 1) * hpPerLevel;
    },
  },

  'Pathfinder 2e': {
    systemName: 'Pathfinder 2e',
    attributes: [
      {
        name: 'strength',
        displayName: 'STR',
        description: 'Physical power',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
      {
        name: 'dexterity',
        displayName: 'DEX',
        description: 'Agility and reflexes',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
      {
        name: 'constitution',
        displayName: 'CON',
        description: 'Endurance',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
      {
        name: 'intelligence',
        displayName: 'INT',
        description: 'Reasoning and memory',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
      {
        name: 'wisdom',
        displayName: 'WIS',
        description: 'Awareness and insight',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
      {
        name: 'charisma',
        displayName: 'CHA',
        description: 'Force of personality',
        defaultValue: 8,
        minValue: 8,
        maxValue: 15,
      },
    ],
    modifierCalculation: (value) => Math.floor((value - 10) / 2),
    levelUpPoints: 1,
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],

    // Point-buy system: Same as D&D 5e
    pointBuy: {
      totalPoints: 27,
      calculateCost: (value, _defaultValue) => {
        if (value <= 8) return 0;
        if (value === 9) return 1;
        if (value === 10) return 2;
        if (value === 11) return 3;
        if (value === 12) return 4;
        if (value === 13) return 5;
        if (value === 14) return 7;
        if (value === 15) return 9;
        return 0;
      },
    },

    // HP calculation: 10 + CON modifier per level (similar to D&D 5e)
    calculateMaxHP: (character, level) => {
      const conMod = Math.floor((character.attributes.constitution - 10) / 2);
      const hpPerLevel = Math.max(1, 5 + conMod);
      const baseHP = Math.max(1, 10 + conMod);

      if (level === 1) {
        return baseHP;
      }
      return baseHP + (level - 1) * hpPerLevel;
    },
  },

  'Call of Cthulhu': {
    systemName: 'Call of Cthulhu',
    attributes: [
      {
        name: 'STR',
        displayName: 'STR',
        description: 'Strength - Physical power',
        defaultValue: 50,
        minValue: 15,
        maxValue: 90,
      },
      {
        name: 'CON',
        displayName: 'CON',
        description: 'Constitution - Health and resilience',
        defaultValue: 50,
        minValue: 15,
        maxValue: 90,
      },
      {
        name: 'SIZ',
        displayName: 'SIZ',
        description: 'Size - Height and build',
        defaultValue: 50,
        minValue: 15,
        maxValue: 90,
      },
      {
        name: 'DEX',
        displayName: 'DEX',
        description: 'Dexterity - Agility and fine motor control',
        defaultValue: 50,
        minValue: 15,
        maxValue: 90,
      },
      {
        name: 'APP',
        displayName: 'APP',
        description: 'Appearance - Physical attractiveness',
        defaultValue: 50,
        minValue: 15,
        maxValue: 90,
      },
      {
        name: 'INT',
        displayName: 'INT',
        description: 'Intelligence - Learning and memory',
        defaultValue: 50,
        minValue: 15,
        maxValue: 90,
      },
      {
        name: 'POW',
        displayName: 'POW',
        description: 'Power - Willpower and sanity',
        defaultValue: 50,
        minValue: 15,
        maxValue: 90,
      },
      {
        name: 'EDU',
        displayName: 'EDU',
        description: 'Education - Knowledge and training',
        defaultValue: 50,
        minValue: 15,
        maxValue: 90,
      },
    ],
    modifierCalculation: undefined, // Percentage-based system
    levelUpPoints: 2, // Increase 2 attributes per milestone
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],

    // Point-buy system: 400 points total (8 attributes × 50 average)
    pointBuy: {
      totalPoints: 400,
      calculateCost: (value, _defaultValue) => {
        // Simple 1:1 cost for CoC percentage system
        return value;
      },
    },

    // HP calculation: (CON + SIZ) / 10, rounded up
    // Using realistic default values of 50 for average human
    calculateMaxHP: (character) => {
      const con = character.attributes.CON || 50;
      const siz = character.attributes.SIZ || 50;
      // (50 + 50) / 10 = 10 HP for average character
      return Math.ceil((con + siz) / 10);
    },

    // Call of Cthulhu specific resources
    resources: [
      {
        name: 'sanity',
        displayName: 'Sanity',
        description: 'Mental stability and resistance to cosmic horror',
        color: '#6495ed', // Cornflower blue
      },
      {
        name: 'magicPoints',
        displayName: 'Magic Points',
        description: 'Power available for casting spells',
        color: '#9370db', // Medium purple
      },
    ],

    calculateMaxResources: (character) => {
      const pow = character.attributes.POW || 50;
      return {
        sanity: pow, // Starting Sanity = POW
        magicPoints: Math.floor(pow / 5), // Magic Points = POW / 5
      };
    },
  },

  'Cyberpunk RED': {
    systemName: 'Cyberpunk RED',
    attributes: [
      {
        name: 'intelligence',
        displayName: 'INT',
        description: 'Intelligence - Problem solving',
        defaultValue: 5,
        minValue: 2,
        maxValue: 10,
      },
      {
        name: 'reflexes',
        displayName: 'REF',
        description: 'Reflexes - Speed and reaction time',
        defaultValue: 5,
        minValue: 2,
        maxValue: 10,
      },
      {
        name: 'dexterity',
        displayName: 'DEX',
        description: 'Dexterity - Manual dexterity',
        defaultValue: 5,
        minValue: 2,
        maxValue: 10,
      },
      {
        name: 'technique',
        displayName: 'TECH',
        description: 'Technique - Technical ability',
        defaultValue: 5,
        minValue: 2,
        maxValue: 10,
      },
      {
        name: 'cool',
        displayName: 'COOL',
        description: 'Cool - Ability to stay calm',
        defaultValue: 5,
        minValue: 2,
        maxValue: 10,
      },
      {
        name: 'willpower',
        displayName: 'WILL',
        description: 'Willpower - Determination',
        defaultValue: 5,
        minValue: 2,
        maxValue: 10,
      },
      {
        name: 'luck',
        displayName: 'LUCK',
        description: 'Luck - Good fortune',
        defaultValue: 5,
        minValue: 2,
        maxValue: 10,
      },
      {
        name: 'move',
        displayName: 'MOVE',
        description: 'Move - Movement speed',
        defaultValue: 5,
        minValue: 2,
        maxValue: 10,
      },
      {
        name: 'body',
        displayName: 'BODY',
        description: 'Body - Physical strength and health',
        defaultValue: 5,
        minValue: 2,
        maxValue: 10,
      },
      {
        name: 'empathy',
        displayName: 'EMP',
        description: 'Empathy - Human connection',
        defaultValue: 5,
        minValue: 2,
        maxValue: 10,
      },
    ],
    modifierCalculation: (value) => value - 5, // Simple modifier (value - 5)
    levelUpPoints: 1,
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],

    // Point-buy system: 60 points total (10 attributes × 6 average)
    pointBuy: {
      totalPoints: 60,
      calculateCost: (value, _defaultValue) => {
        // Simple 1:1 cost
        return value;
      },
    },

    // HP calculation: 10 + (BODY × 5)
    calculateMaxHP: (character, level) => {
      const body = character.attributes.body || 5;
      return 10 + (body * 5) + ((level - 1) * 5);
    },
  },

  'Vampire: The Masquerade': {
    systemName: 'Vampire: The Masquerade',
    attributes: [
      // Physical
      {
        name: 'strength',
        displayName: 'Strength',
        description: 'Physical - Raw physical power',
        defaultValue: 1,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'dexterity',
        displayName: 'Dexterity',
        description: 'Physical - Agility and grace',
        defaultValue: 1,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'stamina',
        displayName: 'Stamina',
        description: 'Physical - Endurance and resilience',
        defaultValue: 1,
        minValue: 1,
        maxValue: 5,
      },
      // Social
      {
        name: 'charisma',
        displayName: 'Charisma',
        description: 'Social - Natural charm',
        defaultValue: 1,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'manipulation',
        displayName: 'Manipulation',
        description: 'Social - Ability to influence others',
        defaultValue: 1,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'composure',
        displayName: 'Composure',
        description: 'Social - Self-control and poise',
        defaultValue: 1,
        minValue: 1,
        maxValue: 5,
      },
      // Mental
      {
        name: 'intelligence',
        displayName: 'Intelligence',
        description: 'Mental - Reasoning and analysis',
        defaultValue: 1,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'wits',
        displayName: 'Wits',
        description: 'Mental - Quick thinking',
        defaultValue: 1,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'resolve',
        displayName: 'Resolve',
        description: 'Mental - Determination and focus',
        defaultValue: 1,
        minValue: 1,
        maxValue: 5,
      },
    ],
    modifierCalculation: undefined, // Dot-based system
    levelUpPoints: 1,
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],

    // Point-buy system: Dot priority (7/5/3 dots across Physical/Social/Mental)
    pointBuy: {
      totalPoints: 15, // Total dots to distribute (7+5+3)
      calculateCost: (value, _defaultValue) => {
        // Cost in dots (each point costs 1 dot)
        return Math.max(0, value - 1); // First dot is free (min is 1)
      },
    },

    // HP calculation: Stamina + Size (simplified - VtM uses Health Levels)
    // Base 7 health levels + Stamina (vampires are tougher than humans)
    calculateMaxHP: (character) => {
      const stamina = character.attributes.stamina || 2;
      // Base 7 health levels + Stamina bonus
      return 7 + stamina;
    },

    // Vampire-specific: Blood Points
    resources: [
      {
        name: 'bloodPoints',
        displayName: 'Blood Points',
        description: 'Vitae for vampiric powers',
        color: '#8b0000', // Dark red
      },
    ],

    calculateMaxResources: () => {
      return {
        bloodPoints: 10, // Standard starting blood pool
      };
    },
  },

  'Generic': {
    systemName: 'Generic',
    attributes: [
      {
        name: 'strength',
        displayName: 'Strength',
        description: 'Physical power and athleticism',
        defaultValue: 1,
        minValue: 1,
        maxValue: 20,
      },
      {
        name: 'agility',
        displayName: 'Agility',
        description: 'Speed, coordination, and reflexes',
        defaultValue: 1,
        minValue: 1,
        maxValue: 20,
      },
      {
        name: 'mind',
        displayName: 'Mind',
        description: 'Intelligence, memory, and willpower',
        defaultValue: 1,
        minValue: 1,
        maxValue: 20,
      },
      {
        name: 'presence',
        displayName: 'Presence',
        description: 'Charisma, leadership, and influence',
        defaultValue: 1,
        minValue: 1,
        maxValue: 20,
      },
    ],
    modifierCalculation: (value) => Math.floor((value - 10) / 2),
    levelUpPoints: 2,
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],

    // Point-buy system: 50 points (4 attributes × 10 average + 10 bonus)
    pointBuy: {
      totalPoints: 50,
      calculateCost: (value, _defaultValue) => {
        // Simple 1:1 cost
        return value;
      },
    },

    // HP calculation: Simple formula based on Strength
    calculateMaxHP: (character, level) => {
      const strengthMod = Math.floor((character.attributes.strength - 10) / 2);
      return 10 + strengthMod + (level - 1) * (5 + strengthMod);
    },
  },
};

/**
 * Calculate total point cost for current attribute values
 */
export function calculateTotalPointCost(
  attributes: Record<string, number>,
  template: SystemTemplate
): number {
  if (!template.pointBuy) return 0;

  let totalCost = 0;
  template.attributes.forEach((attrDef) => {
    const value = attributes[attrDef.name] || attrDef.defaultValue;
    const cost = template.pointBuy!.calculateCost(value, attrDef.defaultValue);
    totalCost += cost;
  });

  return totalCost;
}

/**
 * Check if attribute value change is valid within point-buy limits
 */
export function isValidAttributeChange(
  attributes: Record<string, number>,
  attributeName: string,
  newValue: number,
  template: SystemTemplate
): boolean {
  if (!template.pointBuy) return true; // No point-buy system

  // Create temporary attributes with new value
  const tempAttributes = { ...attributes, [attributeName]: newValue };
  const totalCost = calculateTotalPointCost(tempAttributes, template);

  return totalCost <= template.pointBuy.totalPoints;
}

/**
 * Get the system template for a given RPG system name
 * Falls back to Generic if system not found
 */
export function getSystemTemplate(systemName: string): SystemTemplate {
  return attributeTemplates[systemName] || attributeTemplates['Generic'];
}

/**
 * Create initial character with default attributes for the system
 */
export function createInitialCharacter(
  campaignId: string,
  campaignSystem: string,
  name?: string
): Character {
  const template = getSystemTemplate(campaignSystem);
  const attributes: Record<string, number> = {};

  // Initialize all attributes with default values
  template.attributes.forEach((attr) => {
    attributes[attr.name] = attr.defaultValue;
  });

  // Create temporary character object for HP calculation
  const tempCharacter: Character = {
    id: ulid(),
    campaignId,
    name: name || 'Adventurer',
    level: 1,
    experience: 0,
    attributes,
    hitPoints: 0, // Will be calculated
    maxHitPoints: 0, // Will be calculated
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Calculate max HP based on system template
  const maxHP = template.calculateMaxHP(tempCharacter, 1);
  tempCharacter.maxHitPoints = maxHP;
  tempCharacter.hitPoints = maxHP; // Start at full HP

  // Calculate resources if system has them
  if (template.resources && template.calculateMaxResources) {
    const maxResources = template.calculateMaxResources(tempCharacter, 1);
    tempCharacter.maxResources = maxResources;
    tempCharacter.resources = { ...maxResources }; // Start at full resources
  }

  return tempCharacter;
}

/**
 * Get attribute modifier (for systems that use modifiers like D&D)
 */
export function getAttributeModifier(
  attributeValue: number,
  template: SystemTemplate
): number | undefined {
  if (!template.modifierCalculation) return undefined;
  return template.modifierCalculation(attributeValue);
}

/**
 * Validate attribute value against template constraints
 */
export function isValidAttributeValue(
  value: number,
  attributeDef: AttributeDefinition
): boolean {
  return value >= attributeDef.minValue && value <= attributeDef.maxValue;
}
