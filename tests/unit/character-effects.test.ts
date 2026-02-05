import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseCharacterEffects } from '../../src/services/ai/context-assembler';
import { useCharacterStore } from '../../src/store/character-store';
import * as characterRepo from '../../src/services/storage/character-repo';
import type { Character } from '../../src/types/models';

describe('Character Effects', () => {
  describe('parseCharacterEffects - <damage> tag', () => {
    it('parses single damage tag', () => {
      const content = 'The orc hits you! <damage>5</damage> You stagger.';
      const { cleanContent, effects } = parseCharacterEffects(content);

      expect(effects).toHaveLength(1);
      expect(effects[0]).toEqual({ type: 'damage', amount: 5 });
      expect(cleanContent).not.toContain('<damage>');
      expect(cleanContent).toContain('The orc hits you!');
    });

    it('parses multiple damage tags', () => {
      const content = '<damage>3</damage> First hit. <damage>2</damage> Second hit.';
      const { effects } = parseCharacterEffects(content);

      expect(effects).toHaveLength(2);
      expect(effects[0]).toEqual({ type: 'damage', amount: 3 });
      expect(effects[1]).toEqual({ type: 'damage', amount: 2 });
    });

    it('parses damage with double digits', () => {
      const { effects } = parseCharacterEffects('Critical! <damage>25</damage>');
      expect(effects[0]).toEqual({ type: 'damage', amount: 25 });
    });

    it('returns empty effects when no damage tag', () => {
      const { effects } = parseCharacterEffects('You dodge the attack.');
      expect(effects).toHaveLength(0);
    });
  });

  describe('parseCharacterEffects - <heal> tag', () => {
    it('parses single heal tag', () => {
      const content = 'You drink the potion. <heal>10</heal> You feel better.';
      const { cleanContent, effects } = parseCharacterEffects(content);

      expect(effects).toHaveLength(1);
      expect(effects[0]).toEqual({ type: 'heal', amount: 10 });
      expect(cleanContent).not.toContain('<heal>');
    });

    it('parses multiple heal tags', () => {
      const content = '<heal>5</heal> Minor healing. <heal>15</heal> Full restore.';
      const { effects } = parseCharacterEffects(content);

      expect(effects).toHaveLength(2);
      expect(effects[0]).toEqual({ type: 'heal', amount: 5 });
      expect(effects[1]).toEqual({ type: 'heal', amount: 15 });
    });

    it('parses heal case insensitively', () => {
      const { effects } = parseCharacterEffects('<HEAL>8</HEAL>');
      expect(effects[0]).toEqual({ type: 'heal', amount: 8 });
    });
  });

  describe('parseCharacterEffects - damage and heal combined', () => {
    it('parses both tags in same content', () => {
      const content = 'You take <damage>7</damage> but the cleric <heal>10</heal> saves you.';
      const { effects } = parseCharacterEffects(content);

      expect(effects).toHaveLength(2);
      expect(effects).toContainEqual({ type: 'damage', amount: 7 });
      expect(effects).toContainEqual({ type: 'heal', amount: 10 });
      expect(effects[0].type).toBe('damage');
      expect(effects[1].type).toBe('heal');
    });
  });

  describe('character-store - takeDamage, heal, fullRest', () => {
    const mockCharacter: Character = {
      id: 'char-1',
      campaignId: 'camp-1',
      name: 'Test Hero',
      level: 1,
      experience: 0,
      attributes: { strength: 5, agility: 5, mind: 5, presence: 5 },
      hitPoints: 10,
      maxHitPoints: 15,
      createdAt: 0,
      updatedAt: 0,
    };

    beforeEach(() => {
      vi.restoreAllMocks();
      useCharacterStore.getState().clearCharacter();
      useCharacterStore.getState().setCharacter(mockCharacter);
    });

    it('takeDamage reduces HP correctly', async () => {
      const updatedChar = { ...mockCharacter, hitPoints: 5 };
      vi.spyOn(characterRepo, 'updateCharacterHP').mockResolvedValue(updatedChar);

      await useCharacterStore.getState().takeDamage(5);

      expect(characterRepo.updateCharacterHP).toHaveBeenCalledWith('char-1', 5);
      expect(useCharacterStore.getState().character?.hitPoints).toBe(5);
    });

    it('takeDamage does not go below 0', async () => {
      const updatedChar = { ...mockCharacter, hitPoints: 0 };
      vi.spyOn(characterRepo, 'updateCharacterHP').mockResolvedValue(updatedChar);

      await useCharacterStore.getState().takeDamage(999);

      expect(characterRepo.updateCharacterHP).toHaveBeenCalledWith('char-1', 0);
    });

    it('heal increases HP correctly', async () => {
      useCharacterStore.getState().setCharacter({ ...mockCharacter, hitPoints: 5 });
      const updatedChar = { ...mockCharacter, hitPoints: 10 };
      vi.spyOn(characterRepo, 'updateCharacterHP').mockResolvedValue(updatedChar);

      await useCharacterStore.getState().heal(5);

      expect(characterRepo.updateCharacterHP).toHaveBeenCalledWith('char-1', 10);
      expect(useCharacterStore.getState().character?.hitPoints).toBe(10);
    });

    it('heal does not exceed maxHitPoints', async () => {
      useCharacterStore.getState().setCharacter({ ...mockCharacter, hitPoints: 12 });
      const updatedChar = { ...mockCharacter, hitPoints: 15 };
      vi.spyOn(characterRepo, 'updateCharacterHP').mockResolvedValue(updatedChar);

      await useCharacterStore.getState().heal(10);

      expect(characterRepo.updateCharacterHP).toHaveBeenCalledWith('char-1', 15);
    });

    it('fullRest restores HP to max', async () => {
      useCharacterStore.getState().setCharacter({ ...mockCharacter, hitPoints: 3 });
      const updatedChar = { ...mockCharacter, hitPoints: 15 };
      vi.spyOn(characterRepo, 'updateCharacterHP').mockResolvedValue(updatedChar);

      await useCharacterStore.getState().fullRest();

      expect(characterRepo.updateCharacterHP).toHaveBeenCalledWith(
        'char-1',
        15 // maxHitPoints
      );
    });

    it('fullRest restores all resources to max', async () => {
      const charWithResources: Character = {
        ...mockCharacter,
        hitPoints: 5,
        resources: { sanity: 5, magicPoints: 3 },
        maxResources: { sanity: 10, magicPoints: 5 },
      };
      useCharacterStore.getState().setCharacter(charWithResources);

      vi.spyOn(characterRepo, 'updateCharacterHP').mockResolvedValue({
        ...charWithResources,
        hitPoints: 15,
      });
      vi.spyOn(characterRepo, 'updateCharacterResource').mockResolvedValue({
        ...charWithResources,
        resources: { sanity: 10, magicPoints: 5 },
      } as Character);

      await useCharacterStore.getState().fullRest();

      expect(characterRepo.updateCharacterResource).toHaveBeenCalledWith(
        'char-1',
        'sanity',
        10
      );
      expect(characterRepo.updateCharacterResource).toHaveBeenCalledWith(
        'char-1',
        'magicPoints',
        5
      );
    });
  });
});
