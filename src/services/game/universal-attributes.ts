/**
 * UNIVERSAL ATTRIBUTE SYSTEM - IMMUTABLE
 *
 * Single canonical set for ALL narrative experiences.
 * Presets define flavor (consequences, narrative), NOT attributes.
 *
 * DO NOT MODIFY. This is the single source of truth for attributes.
 */

/**
 * Attribute definition shape - shared by universal attributes
 */
export interface AttributeDefinition {
  name: string;
  displayName: string;
  description: string;
  defaultValue: number;
  minValue: number;
  maxValue: number;
}

/**
 * The four universal attributes - immutable, used by every preset
 */
export const UNIVERSAL_ATTRIBUTES: readonly AttributeDefinition[] = Object.freeze([
  {
    name: 'strength',
    displayName: 'Strength',
    description: 'Physical power, raw strength. Covers melee combat, breaking things, carrying, endurance.',
    defaultValue: 5,
    minValue: 1,
    maxValue: 20,
  },
  {
    name: 'agility',
    displayName: 'Agility',
    description: 'Speed, reflexes, coordination. Covers stealth, dodging, acrobatics, precision.',
    defaultValue: 5,
    minValue: 1,
    maxValue: 20,
  },
  {
    name: 'mind',
    displayName: 'Mind',
    description: 'Intelligence, memory, willpower. Covers investigation, magic, mental resistance, analysis.',
    defaultValue: 5,
    minValue: 1,
    maxValue: 20,
  },
  {
    name: 'presence',
    displayName: 'Presence',
    description: 'Charisma, influence, leadership. Covers persuasion, intimidation, negotiation, command.',
    defaultValue: 5,
    minValue: 1,
    maxValue: 20,
  },
]) as readonly AttributeDefinition[];

export type UniversalAttributeName = 'strength' | 'agility' | 'mind' | 'presence';

/**
 * Universal modifier calculation: 1-20 scale -> -2 to +7
 * Same formula for all presets
 */
export function UNIVERSAL_MODIFIER_CALC(value: number): number {
  if (value <= 2) return -2;
  if (value <= 4) return -1;
  if (value <= 6) return 0;
  if (value <= 8) return 1;
  if (value <= 10) return 2;
  if (value <= 12) return 3;
  if (value <= 14) return 4;
  if (value <= 16) return 5;
  if (value <= 18) return 6;
  return 7; // 19-20
}

/**
 * Universal point-buy for character creation
 */
export const UNIVERSAL_POINT_BUY = Object.freeze({
  totalPoints: 40,
  calculateCost: (value: number, _defaultValue: number) => value,
});

/**
 * Legacy attribute name -> universal attribute mapping
 * When multiple legacy attrs map to one universal, we take the max value
 */
const LEGACY_TO_UNIVERSAL: Record<string, UniversalAttributeName> = {
  // -> strength
  strength: 'strength',
  STR: 'strength',
  body: 'strength',
  BODY: 'strength',
  constitution: 'strength',
  CON: 'strength',
  stamina: 'strength',
  SIZ: 'strength',
  // -> agility
  agility: 'agility',
  dexterity: 'agility',
  DEX: 'agility',
  reflexes: 'agility',
  REF: 'agility',
  move: 'agility',
  MOVE: 'agility',
  technique: 'agility',
  TECH: 'agility',
  // -> mind
  mind: 'mind',
  intelligence: 'mind',
  INT: 'mind',
  wits: 'mind',
  resolve: 'mind',
  POW: 'mind',
  EDU: 'mind',
  willpower: 'mind',
  WILL: 'mind',
  cool: 'mind',
  luck: 'mind',
  LUCK: 'mind',
  // -> presence
  presence: 'presence',
  charisma: 'presence',
  CHA: 'presence',
  APP: 'presence',
  manipulation: 'presence',
  composure: 'presence',
  empathy: 'presence',
  EMP: 'presence',
};

const UNIVERSAL_ATTR_NAMES: UniversalAttributeName[] = ['strength', 'agility', 'mind', 'presence'];
const DEFAULT_VALUE = 5;

/**
 * Migrate legacy character attributes to the universal 4-attribute set.
 * When multiple legacy attributes map to one universal, takes the max value.
 * Unknown attributes are ignored. Missing universals get default (5).
 */
export function migrateLegacyAttributes(
  oldAttributes: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = {
    strength: DEFAULT_VALUE,
    agility: DEFAULT_VALUE,
    mind: DEFAULT_VALUE,
    presence: DEFAULT_VALUE,
  };

  for (const [legacyName, value] of Object.entries(oldAttributes)) {
    const universalName =
      LEGACY_TO_UNIVERSAL[legacyName] ??
      LEGACY_TO_UNIVERSAL[legacyName.toLowerCase()] ??
      LEGACY_TO_UNIVERSAL[legacyName.toUpperCase()];
    if (universalName && typeof value === 'number') {
      // Normalize to 1-20: percentage systems (15-99) scale down; 1-20 stays; 1-5 scales up
      const normalized =
        value > 20
          ? Math.round(1 + ((Math.min(99, value) - 15) / 84) * 19) // CoC-style 15-99
          : value >= 1 && value <= 5
            ? Math.round(value * 4) // Vampire-style 1-5
            : value;
      const clamped = Math.max(1, Math.min(20, normalized));
      result[universalName] = Math.max(result[universalName], clamped);
    }
  }

  return result;
}

/**
 * Check if attributes need migration (any key not in universal set)
 */
export function needsAttributeMigration(attributes: Record<string, number>): boolean {
  const universalNames = new Set(UNIVERSAL_ATTR_NAMES);
  return Object.keys(attributes).some((k) => !universalNames.has(k as UniversalAttributeName));
}
