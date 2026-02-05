import { describe, it, expect } from 'vitest';
import {
  detectClaimedRoll,
  getMisfortunePenalty,
  applyMisfortuneToRoll,
} from '../../src/services/game/misfortune';

describe('misfortune (amarra)', () => {
  describe('detectClaimedRoll', () => {
    it('detects Portuguese patterns', () => {
      expect(detectClaimedRoll('Eu tirei 20 no dado!')).toBe(20);
      expect(detectClaimedRoll('Rolei um 15')).toBe(15);
      expect(detectClaimedRoll('O dado deu 1')).toBe(1);
    });

    it('detects English patterns', () => {
      expect(detectClaimedRoll('I rolled a natural 20!')).toBe(20);
      expect(detectClaimedRoll('I got 18 on the die')).toBe(18);
    });

    it('returns null for normal messages', () => {
      expect(detectClaimedRoll('I attack the orc')).toBeNull();
      expect(detectClaimedRoll('What do you do?')).toBeNull();
      expect(detectClaimedRoll('The guard has 20 HP')).toBeNull(); // 20 in different context
    });
  });

  describe('getMisfortunePenalty', () => {
    it('returns 0 for no misfortune', () => {
      expect(getMisfortunePenalty(0)).toBe(0);
    });

    it('returns 1 per stack up to 5', () => {
      expect(getMisfortunePenalty(1)).toBe(1);
      expect(getMisfortunePenalty(3)).toBe(3);
      expect(getMisfortunePenalty(5)).toBe(5);
    });

    it('caps at 5', () => {
      expect(getMisfortunePenalty(10)).toBe(5);
    });
  });

  describe('applyMisfortuneToRoll', () => {
    it('returns same value when no misfortune', () => {
      expect(applyMisfortuneToRoll(18, 0)).toBe(18);
    });

    it('subtracts penalty from roll', () => {
      expect(applyMisfortuneToRoll(18, 2)).toBe(16);
      expect(applyMisfortuneToRoll(20, 5)).toBe(15);
    });

    it('never goes below 1', () => {
      expect(applyMisfortuneToRoll(3, 5)).toBe(1);
    });
  });
});
