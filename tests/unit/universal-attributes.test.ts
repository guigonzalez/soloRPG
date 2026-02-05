import { describe, it, expect } from 'vitest';
import {
  UNIVERSAL_ATTRIBUTES,
  UNIVERSAL_MODIFIER_CALC,
  migrateLegacyAttributes,
  needsAttributeMigration,
} from '../../src/services/game/universal-attributes';

describe('universal-attributes', () => {
  describe('UNIVERSAL_ATTRIBUTES', () => {
    it('has exactly 4 attributes', () => {
      expect(UNIVERSAL_ATTRIBUTES).toHaveLength(4);
    });

    it('has strength, agility, mind, presence', () => {
      const names = UNIVERSAL_ATTRIBUTES.map((a) => a.name);
      expect(names).toEqual(['strength', 'agility', 'mind', 'presence']);
    });

    it('each attribute has required fields', () => {
      for (const attr of UNIVERSAL_ATTRIBUTES) {
        expect(attr).toHaveProperty('name');
        expect(attr).toHaveProperty('displayName');
        expect(attr).toHaveProperty('description');
        expect(attr).toHaveProperty('defaultValue', 5);
        expect(attr).toHaveProperty('minValue', 1);
        expect(attr).toHaveProperty('maxValue', 20);
      }
    });
  });

  describe('UNIVERSAL_MODIFIER_CALC', () => {
    it('returns -2 for values 1-2', () => {
      expect(UNIVERSAL_MODIFIER_CALC(1)).toBe(-2);
      expect(UNIVERSAL_MODIFIER_CALC(2)).toBe(-2);
    });

    it('returns 0 for values 5-6', () => {
      expect(UNIVERSAL_MODIFIER_CALC(5)).toBe(0);
      expect(UNIVERSAL_MODIFIER_CALC(6)).toBe(0);
    });

    it('returns +7 for values 19-20', () => {
      expect(UNIVERSAL_MODIFIER_CALC(19)).toBe(7);
      expect(UNIVERSAL_MODIFIER_CALC(20)).toBe(7);
    });
  });

  describe('migrateLegacyAttributes', () => {
    it('returns universal attributes for empty input', () => {
      const result = migrateLegacyAttributes({});
      expect(result).toEqual({
        strength: 5,
        agility: 5,
        mind: 5,
        presence: 5,
      });
    });

    it('maps D&D attributes to universal', () => {
      const result = migrateLegacyAttributes({
        strength: 14,
        dexterity: 12,
        constitution: 11,
        intelligence: 16,
        wisdom: 13,
        charisma: 8,
      });
      expect(result.strength).toBe(14);
      expect(result.agility).toBe(12);
      expect(result.mind).toBe(16); // max of int, wisdom
      expect(result.presence).toBe(8);
    });

    it('maps CoC percentage attributes (15-99) to 1-20 scale', () => {
      const result = migrateLegacyAttributes({
        STR: 55,
        DEX: 60,
        INT: 70,
        POW: 60,
      });
      // 55 -> round(1 + (55-15)/84*19) ≈ 10, 60 -> ≈ 11, 70 -> ≈ 13
      expect(result.strength).toBe(10);
      expect(result.agility).toBe(11);
      expect(result.mind).toBe(13); // max of INT 70, POW 60
      expect(result.presence).toBe(5); // default, no mapping
    });

    it('passes through already-universal attributes', () => {
      const result = migrateLegacyAttributes({
        strength: 10,
        agility: 8,
        mind: 12,
        presence: 6,
      });
      expect(result).toEqual({
        strength: 10,
        agility: 8,
        mind: 12,
        presence: 6,
      });
    });
  });

  describe('needsAttributeMigration', () => {
    it('returns false for universal attributes', () => {
      expect(
        needsAttributeMigration({ strength: 10, agility: 8, mind: 12, presence: 6 })
      ).toBe(false);
    });

    it('returns true for legacy D&D attributes', () => {
      expect(
        needsAttributeMigration({
          strength: 14,
          dexterity: 12,
          constitution: 11,
          intelligence: 16,
          wisdom: 13,
          charisma: 8,
        })
      ).toBe(true);
    });

    it('returns true for legacy CoC attributes', () => {
      expect(needsAttributeMigration({ STR: 55, DEX: 60, INT: 70 })).toBe(true);
    });
  });
});
