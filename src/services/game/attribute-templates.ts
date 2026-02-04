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
 * Complete template for an RPG system
 */
export interface SystemTemplate {
  systemName: string;
  attributes: AttributeDefinition[];
  modifierCalculation?: (value: number) => number; // For D&D-style modifiers
  levelUpPoints: number; // Attribute points gained per level
  experienceTable: number[]; // XP required for each level (moderate progression)
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
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
      {
        name: 'dexterity',
        displayName: 'DEX',
        description: 'Agility, reflexes, and balance',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
      {
        name: 'constitution',
        displayName: 'CON',
        description: 'Health, stamina, and vital force',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
      {
        name: 'intelligence',
        displayName: 'INT',
        description: 'Reasoning, memory, and analytical skill',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
      {
        name: 'wisdom',
        displayName: 'WIS',
        description: 'Awareness, intuition, and insight',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
      {
        name: 'charisma',
        displayName: 'CHA',
        description: 'Force of personality and leadership',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
    ],
    modifierCalculation: (value) => Math.floor((value - 10) / 2),
    levelUpPoints: 1, // 1 attribute point every 4 levels (simplified)
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],
  },

  'Pathfinder 2e': {
    systemName: 'Pathfinder 2e',
    attributes: [
      {
        name: 'strength',
        displayName: 'STR',
        description: 'Physical power',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
      {
        name: 'dexterity',
        displayName: 'DEX',
        description: 'Agility and reflexes',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
      {
        name: 'constitution',
        displayName: 'CON',
        description: 'Endurance',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
      {
        name: 'intelligence',
        displayName: 'INT',
        description: 'Reasoning and memory',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
      {
        name: 'wisdom',
        displayName: 'WIS',
        description: 'Awareness and insight',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
      {
        name: 'charisma',
        displayName: 'CHA',
        description: 'Force of personality',
        defaultValue: 10,
        minValue: 3,
        maxValue: 20,
      },
    ],
    modifierCalculation: (value) => Math.floor((value - 10) / 2),
    levelUpPoints: 1,
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],
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
        maxValue: 99,
      },
      {
        name: 'CON',
        displayName: 'CON',
        description: 'Constitution - Health and resilience',
        defaultValue: 50,
        minValue: 15,
        maxValue: 99,
      },
      {
        name: 'SIZ',
        displayName: 'SIZ',
        description: 'Size - Height and build',
        defaultValue: 50,
        minValue: 15,
        maxValue: 99,
      },
      {
        name: 'DEX',
        displayName: 'DEX',
        description: 'Dexterity - Agility and fine motor control',
        defaultValue: 50,
        minValue: 15,
        maxValue: 99,
      },
      {
        name: 'APP',
        displayName: 'APP',
        description: 'Appearance - Physical attractiveness',
        defaultValue: 50,
        minValue: 15,
        maxValue: 99,
      },
      {
        name: 'INT',
        displayName: 'INT',
        description: 'Intelligence - Learning and memory',
        defaultValue: 50,
        minValue: 15,
        maxValue: 99,
      },
      {
        name: 'POW',
        displayName: 'POW',
        description: 'Power - Willpower and sanity',
        defaultValue: 50,
        minValue: 15,
        maxValue: 99,
      },
      {
        name: 'EDU',
        displayName: 'EDU',
        description: 'Education - Knowledge and training',
        defaultValue: 50,
        minValue: 15,
        maxValue: 99,
      },
    ],
    modifierCalculation: undefined, // Percentage-based system
    levelUpPoints: 2, // Increase 2 attributes per milestone
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],
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
  },

  'Vampire: The Masquerade': {
    systemName: 'Vampire: The Masquerade',
    attributes: [
      // Physical
      {
        name: 'strength',
        displayName: 'Strength',
        description: 'Physical - Raw physical power',
        defaultValue: 2,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'dexterity',
        displayName: 'Dexterity',
        description: 'Physical - Agility and grace',
        defaultValue: 2,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'stamina',
        displayName: 'Stamina',
        description: 'Physical - Endurance and resilience',
        defaultValue: 2,
        minValue: 1,
        maxValue: 5,
      },
      // Social
      {
        name: 'charisma',
        displayName: 'Charisma',
        description: 'Social - Natural charm',
        defaultValue: 2,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'manipulation',
        displayName: 'Manipulation',
        description: 'Social - Ability to influence others',
        defaultValue: 2,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'composure',
        displayName: 'Composure',
        description: 'Social - Self-control and poise',
        defaultValue: 2,
        minValue: 1,
        maxValue: 5,
      },
      // Mental
      {
        name: 'intelligence',
        displayName: 'Intelligence',
        description: 'Mental - Reasoning and analysis',
        defaultValue: 2,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'wits',
        displayName: 'Wits',
        description: 'Mental - Quick thinking',
        defaultValue: 2,
        minValue: 1,
        maxValue: 5,
      },
      {
        name: 'resolve',
        displayName: 'Resolve',
        description: 'Mental - Determination and focus',
        defaultValue: 2,
        minValue: 1,
        maxValue: 5,
      },
    ],
    modifierCalculation: undefined, // Dot-based system
    levelUpPoints: 1,
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],
  },

  'Generic': {
    systemName: 'Generic',
    attributes: [
      {
        name: 'strength',
        displayName: 'Strength',
        description: 'Physical power and athleticism',
        defaultValue: 10,
        minValue: 1,
        maxValue: 20,
      },
      {
        name: 'agility',
        displayName: 'Agility',
        description: 'Speed, coordination, and reflexes',
        defaultValue: 10,
        minValue: 1,
        maxValue: 20,
      },
      {
        name: 'mind',
        displayName: 'Mind',
        description: 'Intelligence, memory, and willpower',
        defaultValue: 10,
        minValue: 1,
        maxValue: 20,
      },
      {
        name: 'presence',
        displayName: 'Presence',
        description: 'Charisma, leadership, and influence',
        defaultValue: 10,
        minValue: 1,
        maxValue: 20,
      },
    ],
    modifierCalculation: (value) => Math.floor((value - 10) / 2),
    levelUpPoints: 2,
    experienceTable: [0, 600, 1800, 4200, 8400, 15000, 24000, 35000, 48000, 64000],
  },
};

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

  return {
    id: ulid(),
    campaignId,
    name: name || 'Adventurer',
    level: 1,
    experience: 0,
    attributes,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
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
