import { describe, test, expect } from 'vitest';
import { parseDiceNotation, isValidDiceNotation, formatDiceNotation } from '../../src/services/dice/dice-parser';
import { rollDice, rollDiceFromNotation } from '../../src/services/dice/dice-roller';

describe('Dice Parser', () => {
  describe('parseDiceNotation', () => {
    test('parses simple d20 notation', () => {
      const result = parseDiceNotation('d20');
      expect(result).toEqual({ count: 1, sides: 20, modifier: 0 });
    });

    test('parses 1d20 notation', () => {
      const result = parseDiceNotation('1d20');
      expect(result).toEqual({ count: 1, sides: 20, modifier: 0 });
    });

    test('parses 2d6 notation', () => {
      const result = parseDiceNotation('2d6');
      expect(result).toEqual({ count: 2, sides: 6, modifier: 0 });
    });

    test('parses notation with positive modifier', () => {
      const result = parseDiceNotation('d20+5');
      expect(result).toEqual({ count: 1, sides: 20, modifier: 5 });
    });

    test('parses notation with negative modifier', () => {
      const result = parseDiceNotation('2d6-3');
      expect(result).toEqual({ count: 2, sides: 6, modifier: -3 });
    });

    test('handles uppercase notation', () => {
      const result = parseDiceNotation('D20');
      expect(result).toEqual({ count: 1, sides: 20, modifier: 0 });
    });

    test('throws error for invalid notation', () => {
      expect(() => parseDiceNotation('invalid')).toThrow('Invalid dice notation');
      expect(() => parseDiceNotation('2x6')).toThrow('Invalid dice notation');
      expect(() => parseDiceNotation('d')).toThrow('Invalid dice notation');
    });

    test('throws error for invalid count', () => {
      expect(() => parseDiceNotation('0d20')).toThrow('Dice count must be between 1 and 100');
      expect(() => parseDiceNotation('101d20')).toThrow('Dice count must be between 1 and 100');
    });

    test('throws error for invalid sides', () => {
      expect(() => parseDiceNotation('d1')).toThrow('Dice sides must be between 2 and 1000');
      expect(() => parseDiceNotation('d1001')).toThrow('Dice sides must be between 2 and 1000');
    });

    test('throws error for invalid modifier', () => {
      expect(() => parseDiceNotation('d20+101')).toThrow('Modifier must be between -100 and +100');
      expect(() => parseDiceNotation('d20-101')).toThrow('Modifier must be between -100 and +100');
    });
  });

  describe('isValidDiceNotation', () => {
    test('returns true for valid notation', () => {
      expect(isValidDiceNotation('d20')).toBe(true);
      expect(isValidDiceNotation('2d6+3')).toBe(true);
      expect(isValidDiceNotation('1d20-2')).toBe(true);
    });

    test('returns false for invalid notation', () => {
      expect(isValidDiceNotation('invalid')).toBe(false);
      expect(isValidDiceNotation('2x6')).toBe(false);
      expect(isValidDiceNotation('d0')).toBe(false);
    });
  });

  describe('formatDiceNotation', () => {
    test('formats simple notation', () => {
      expect(formatDiceNotation({ count: 1, sides: 20, modifier: 0 })).toBe('d20');
    });

    test('formats notation with count', () => {
      expect(formatDiceNotation({ count: 2, sides: 6, modifier: 0 })).toBe('2d6');
    });

    test('formats notation with positive modifier', () => {
      expect(formatDiceNotation({ count: 1, sides: 20, modifier: 5 })).toBe('d20+5');
    });

    test('formats notation with negative modifier', () => {
      expect(formatDiceNotation({ count: 2, sides: 6, modifier: -3 })).toBe('2d6-3');
    });
  });
});

describe('Dice Roller', () => {
  describe('rollDice', () => {
    test('rolls d20 within valid range', () => {
      const result = rollDice('d20');
      expect(result.notation).toBe('d20');
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeLessThanOrEqual(20);
      expect(result.rolls).toHaveLength(1);
      expect(result.breakdown).toContain('=');
    });

    test('rolls 2d6 within valid range', () => {
      const result = rollDice('2d6');
      expect(result.notation).toBe('2d6');
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeLessThanOrEqual(12);
      expect(result.rolls).toHaveLength(2);
    });

    test('applies positive modifier correctly', () => {
      const result = rollDice('d20+5');
      expect(result.notation).toBe('d20+5');
      expect(result.total).toBeGreaterThanOrEqual(6); // min 1 + 5
      expect(result.total).toBeLessThanOrEqual(25); // max 20 + 5
      expect(result.breakdown).toContain('+');
    });

    test('applies negative modifier correctly', () => {
      const result = rollDice('d20-5');
      expect(result.notation).toBe('d20-5');
      expect(result.total).toBeGreaterThanOrEqual(-4); // min 1 - 5
      expect(result.total).toBeLessThanOrEqual(15); // max 20 - 5
      expect(result.breakdown).toContain('-');
    });

    test('generates proper breakdown for single die', () => {
      const result = rollDice('d20');
      expect(result.breakdown).toMatch(/^\d+ = \d+$/);
    });

    test('generates proper breakdown for multiple dice', () => {
      const result = rollDice('2d6');
      expect(result.breakdown).toMatch(/^\[\d+, \d+\] = \d+$/);
    });

    test('generates proper breakdown with modifier', () => {
      const result = rollDice('2d6+3');
      expect(result.breakdown).toMatch(/^\[\d+, \d+\] \+ 3 = \d+$/);
    });
  });

  describe('rollDiceFromNotation', () => {
    test('rolls from parsed notation', () => {
      const notation = { count: 1, sides: 20, modifier: 0 };
      const result = rollDiceFromNotation(notation);
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeLessThanOrEqual(20);
    });
  });
});
