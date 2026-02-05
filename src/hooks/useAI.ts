import { useChatStore } from '../store/chat-store';
import { useCampaignStore } from '../store/campaign-store';
import { useCharacterStore } from '../store/character-store';
import { getGameEngine } from '../services/game/game-engine';
import * as messageRepo from '../services/storage/message-repo';
import * as recapRepo from '../services/storage/recap-repo';
import * as entityRepo from '../services/storage/entity-repo';
import * as factRepo from '../services/storage/fact-repo';
import * as rollRepo from '../services/storage/roll-repo';
import * as characterRepo from '../services/storage/character-repo';
import { deleteMessagesAfterTimestamp } from '../services/storage/message-repo';
import { deleteRollsAfterTimestamp } from '../services/storage/roll-repo';
import { isValidDiceNotation } from '../services/dice/dice-parser';
import { rollDice } from '../services/dice/dice-roller';
// XP comes from <xp> tags in AI responses (gain or loss per action)
import { getSheetPreset } from '../services/game/sheet-presets';
import {
  detectClaimedRoll,
  applyMisfortuneToRoll,
  MISFORTUNE_MAX,
  MISFORTUNE_DECAY_PER_HONEST_ROLL,
} from '../services/game/misfortune';
import { t } from '../services/i18n/use-i18n';
import type { CharacterEffect } from '../services/ai/context-assembler';
import type { ItemDrop } from '../services/ai/context-assembler';
import { createInventoryItem, getEquipmentRollBonus, getArmorDamageReduction } from '../services/game/inventory';
import type { NewMessage } from '../types/models';

/**
 * Hook to manage AI interactions using real Claude API
 */
export function useAI(campaignId: string | null) {
  const { messages, addMessage, removeMessagesAfter, setAIResponding, setStreamedContent, appendStreamedContent, setError, setPendingRoll, setSuggestedActions } = useChatStore();
  const { getActiveCampaign } = useCampaignStore();
  const gameEngine = getGameEngine();

  /**
   * Apply character effects (HP damage/healing, resource spending/restoration)
   */
  const applyCharacterEffects = async (effects: CharacterEffect[], campaignId: string): Promise<boolean> => {
    const characterStore = useCharacterStore.getState();
    let characterDied = false;

    console.log('[applyCharacterEffects] Processing effects:', effects);

    for (const effect of effects) {
      try {
        console.log('[applyCharacterEffects] Applying effect:', effect);
        switch (effect.type) {
          case 'damage': {
            const character = characterStore.character;
            const armorReduction = character
              ? getArmorDamageReduction(character.equippedArmor, character.inventory)
              : 0;
            const finalDamage = Math.max(0, effect.amount - armorReduction);

            await characterStore.takeDamage(finalDamage);

            let damageContent = t('combat.takeDamage', { amount: finalDamage.toString() });
            if (armorReduction > 0 && effect.amount > 0) {
              damageContent += ` (${t('combat.armorReduced', { reduced: armorReduction.toString(), original: effect.amount.toString() })})`;
            }
            const damageMessage: NewMessage = {
              campaignId,
              role: 'system',
              content: damageContent,
            };
            const savedDamageMessage = await messageRepo.createMessage(damageMessage);
            addMessage(savedDamageMessage);

            const updatedCharacter = characterStore.character;
            if (updatedCharacter && updatedCharacter.hitPoints <= 0) {
              characterDied = true;
            }
            break;
          }

          case 'damage_roll': {
            if (!effect.rollNotation) break;
            const character = characterStore.character;
            const armorReduction = character
              ? getArmorDamageReduction(character.equippedArmor, character.inventory)
              : 0;

            const result = rollDice(effect.rollNotation);
            await rollRepo.createRoll({
              campaignId,
              notation: result.notation,
              result: result.total,
              breakdown: result.breakdown,
            });

            const rawDamage = result.total;
            const finalDamage = Math.max(0, rawDamage - armorReduction);

            await characterStore.takeDamage(finalDamage);

            let damageContent = `🎲 ${t('combat.damageRoll', { notation: effect.rollNotation, result: result.breakdown })} → `;
            damageContent += t('combat.takeDamage', { amount: finalDamage.toString() });
            if (armorReduction > 0 && rawDamage > 0) {
              damageContent += ` (${t('combat.armorReduced', { reduced: armorReduction.toString(), original: rawDamage.toString() })})`;
            }
            const damageMessage: NewMessage = {
              campaignId,
              role: 'system',
              content: damageContent,
            };
            const savedDamageMessage = await messageRepo.createMessage(damageMessage);
            addMessage(savedDamageMessage);

            const updatedCharacter = characterStore.character;
            if (updatedCharacter && updatedCharacter.hitPoints <= 0) {
              characterDied = true;
            }
            break;
          }

          case 'heal': {
            await characterStore.heal(effect.amount);

            // Show heal message in chat
            const healMessage: NewMessage = {
              campaignId,
              role: 'system',
              content: t('combat.recover', { amount: effect.amount.toString() }),
            };
            const savedHealMessage = await messageRepo.createMessage(healMessage);
            addMessage(savedHealMessage);
            break;
          }
        }
      } catch (error) {
        console.error('Failed to apply character effect:', effect, error);
        // Don't throw - continue applying other effects
      }
    }

    return characterDied;
  };

  /**
   * Apply item drops from AI response - add items to character inventory
   */
  const applyItemDrops = async (drops: ItemDrop[], campaignId: string): Promise<void> => {
    if (!drops.length) return;

    const characterStore = useCharacterStore.getState();
    const character = characterStore.character;
    if (!character) return;

    const currentInventory = [...(character.inventory || [])];

    for (const drop of drops) {
      const created = createInventoryItem(drop.itemId, drop.quantity);
      if (!created) continue;

      const existing = currentInventory.find((i) => i.itemId === drop.itemId);
      if (existing && existing.type === 'consumable') {
        existing.quantity += drop.quantity;
      } else {
        currentInventory.push(created);
      }

      const dropMessage: NewMessage = {
        campaignId,
        role: 'system',
        content: `📦 ${t('inventory.itemAcquired', { name: created.name, quantity: drop.quantity.toString() })}`,
      };
      const savedDropMessage = await messageRepo.createMessage(dropMessage);
      addMessage(savedDropMessage);
    }

    await characterStore.updateInventory(currentInventory);
  };

  /**
   * Apply XP change (gain or loss) and show message
   */
  const applyXPChange = async (xpChange: number, campaignId: string, campaignSystem: string): Promise<void> => {
    if (xpChange === 0) return;

    const levelUpResult = await useCharacterStore.getState().updateExperience(xpChange, campaignSystem);

    const isGain = xpChange > 0;
    const xpContent = isGain
      ? `✨ ${t('xp.gained', { amount: xpChange.toString() })}`
      : `⚠️ ${t('xp.lost', { amount: Math.abs(xpChange).toString() })}`;
    const xpMessage: NewMessage = {
      campaignId,
      role: 'system',
      content: xpContent,
    };
    const savedXPMessage = await messageRepo.createMessage(xpMessage);
    addMessage(savedXPMessage);

    if (levelUpResult.leveledUp) {
      const levelUpMessage: NewMessage = {
        campaignId,
        role: 'system',
        content: t('xp.levelUp', { level: levelUpResult.newLevel.toString() }),
      };
      const savedLevelUpMessage = await messageRepo.createMessage(levelUpMessage);
      addMessage(savedLevelUpMessage);
    } else if (levelUpResult.leveledDown) {
      const levelDownMessage: NewMessage = {
        campaignId,
        role: 'system',
        content: t('xp.levelDown', { level: levelUpResult.newLevel.toString() }),
      };
      const savedLevelDownMessage = await messageRepo.createMessage(levelDownMessage);
      addMessage(savedLevelDownMessage);
    }
  };

  /**
   * Generate death message when character dies
   */
  const handleCharacterDeath = async (campaignId: string) => {
    const campaign = getActiveCampaign();
    if (!campaign) return;

    const character = useCharacterStore.getState().character;
    if (!character) return;

    try {
      setAIResponding(true);
      setStreamedContent('');

      // Get death narrative from AI
      const deathPrompt = `The character ${character.name} has been defeated and their hit points reached 0. Generate a dramatic and fitting conclusion to their story. Describe their final moments and the end of their adventure. Keep it 2-3 paragraphs, matching the ${campaign.tone} tone of the campaign.`;

      const recap = await recapRepo.getRecapByCampaign(campaignId) || null;
      const entities = await entityRepo.getEntitiesByCampaign(campaignId);
      const facts = await factRepo.getFactsByCampaign(campaignId);

      const response = await gameEngine.getAIResponse(
        {
          campaign,
          messages: [{
            id: 'death-trigger',
            campaignId,
            role: 'user',
            content: deathPrompt,
            createdAt: Date.now(),
          }],
          recap,
          entities,
          facts,
          character,
        },
        (chunk) => {
          appendStreamedContent(chunk);
        }
      );

      // Save death message
      const deathMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: `💀 **GAME OVER**\n\n${response.content}\n\n_Your adventure has come to an end. You can start a new campaign or return to the main menu._`,
      };

      const savedDeathMessage = await messageRepo.createMessage(deathMessage);
      addMessage(savedDeathMessage);

      setAIResponding(false);
      setStreamedContent('');
    } catch (error) {
      console.error('Error generating death message:', error);

      // Show fallback death message even if AI fails
      const fallbackDeathMessage: NewMessage = {
        campaignId,
        role: 'system',
        content: `💀 **GAME OVER**\n\n${character.name} has fallen in battle. Their hit points reached zero.\n\n_Your adventure has come to an end. You can start a new campaign or return to the main menu._`,
      };

      const savedFallbackMessage = await messageRepo.createMessage(fallbackDeathMessage);
      addMessage(savedFallbackMessage);

      setAIResponding(false);
      setStreamedContent('');
    }
  };

  /**
   * Send message or automatically roll dice if input is dice notation
   */
  const sendMessageOrRoll = async (content: string) => {
    // Block if character is dead (game over)
    const character = useCharacterStore.getState().character;
    if (character && character.hitPoints <= 0) {
      return;
    }

    const trimmedContent = content.trim();

    // Check if input is dice notation (e.g., "1d20", "2d6+3")
    if (isValidDiceNotation(trimmedContent)) {
      // Automatically roll dice
      await handleDiceRoll(trimmedContent);
    } else {
      // Send as regular message
      await sendMessage(trimmedContent);
    }
  };

  /**
   * Handle dice roll: roll, save, display, and send to AI
   */
  const handleDiceRoll = async (notation: string) => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    try {
      // Roll the dice
      const result = rollDice(notation);

      // Save roll to database
      await rollRepo.createRoll({
        campaignId,
        notation: result.notation,
        result: result.total,
        breakdown: result.breakdown,
      });

      // Amarra: apply misfortune penalty
      const character = useCharacterStore.getState().character;
      const misfortune = character?.misfortune ?? 0;
      const effectiveResult = applyMisfortuneToRoll(result.total, misfortune);

      // Create system message for roll result
      const rollDisplay =
        misfortune > 0
          ? `🎲 Rolled ${result.notation}: ${result.breakdown} | ${t('misfortune.effectiveResult', { value: effectiveResult.toString() })}`
          : `🎲 Rolled ${result.notation}: ${result.breakdown}`;

      const rollMessage: NewMessage = {
        campaignId,
        role: 'system',
        content: rollDisplay,
      };

      const savedRollMessage = await messageRepo.createMessage(rollMessage);
      addMessage(savedRollMessage);

      // Decay misfortune on honest roll
      if (character && misfortune > 0) {
        const newMisfortune = Math.max(0, misfortune - MISFORTUNE_DECAY_PER_HONEST_ROLL);
        const updated = await characterRepo.updateCharacterMisfortune(character.id, newMisfortune);
        useCharacterStore.getState().setCharacter(updated);
      }

      // Clear any pending roll
      setPendingRoll(null);

      // Send result to AI for narrative continuation (use effective result)
      await sendMessageAfterRoll(effectiveResult, result.notation);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  /**
   * Resolve attribute modifiers in dice notation (e.g., "1d20+strength" -> "1d20+2")
   * Supports ALL preset attribute names and adds equipment roll bonus
   */
  const resolveAttributeModifiers = (notation: string): string => {
    const character = useCharacterStore.getState().character;
    if (!character) return notation;

    const campaign = getActiveCampaign();
    if (!campaign) return notation;

    const preset = getSheetPreset(campaign.system);
    let resolvedNotation = notation;

    // Sort by name length descending so we replace "dexterity" before "dex"
    const attrsByLength = [...preset.attributes].sort(
      (a, b) => b.name.length - a.name.length
    );

    for (const attrDef of attrsByLength) {
      const attrValue = character.attributes[attrDef.name] || 0;
      const modifier = preset.modifierCalculation
        ? preset.modifierCalculation(attrValue)
        : 0;
      const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

      // Match +attrName or -attrName (case insensitive)
      // Escape special regex chars in attribute name
      const escapedName = attrDef.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRegex = new RegExp(`([+-])${escapedName}(?![a-zA-Z0-9_])`, 'gi');

      resolvedNotation = resolvedNotation.replace(nameRegex, modifierStr);

      // Also match displayName if different from name (e.g. STR vs strength)
      if (attrDef.displayName.toLowerCase() !== attrDef.name.toLowerCase()) {
        const escapedDisplay = attrDef.displayName.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );
        const displayRegex = new RegExp(
          `([+-])${escapedDisplay}(?![a-zA-Z0-9_])`,
          'gi'
        );
        resolvedNotation = resolvedNotation.replace(displayRegex, modifierStr);
      }
    }

    // Add equipment roll bonus (from equipped items with roll_bonus effect)
    const equipmentBonus = getEquipmentRollBonus(character.inventory);
    if (equipmentBonus > 0) {
      // Parse modifier from notation (e.g. "1d20+2" -> add 1 to get "1d20+3")
      const modMatch = resolvedNotation.match(/([+-])(\d+)$/);
      if (modMatch) {
        const sign = modMatch[1];
        const currentMod = parseInt(modMatch[2], 10) * (sign === '-' ? -1 : 1);
        const newMod = currentMod + equipmentBonus;
        const newModStr = newMod >= 0 ? `+${newMod}` : `${newMod}`;
        resolvedNotation = resolvedNotation.replace(/[+-]\d+$/, newModStr);
      } else {
        resolvedNotation = `${resolvedNotation}+${equipmentBonus}`;
      }
    }

    return resolvedNotation;
  };

  /**
   * Send action with automatic roll
   * Used when player selects a suggested action that requires a roll
   */
  const sendActionWithRoll = async (actionText: string, rollNotation: string, _dc?: number) => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    // Block if character is dead (game over)
    const char = useCharacterStore.getState().character;
    if (char && char.hitPoints <= 0) {
      return;
    }

    const campaign = getActiveCampaign();
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    try {
      // 1. Create and save user message with the action
      const userMessage: NewMessage = {
        campaignId,
        role: 'user',
        content: actionText,
      };

      const savedUserMessage = await messageRepo.createMessage(userMessage);
      addMessage(savedUserMessage);

      // 2. Resolve attribute modifiers in the roll notation
      const resolvedNotation = resolveAttributeModifiers(rollNotation);

      // 3. Roll the dice
      const result = rollDice(resolvedNotation);

      // Save roll to database
      await rollRepo.createRoll({
        campaignId,
        notation: result.notation,
        result: result.total,
        breakdown: result.breakdown,
      });

      // Load character for misfortune
      let character = useCharacterStore.getState().character;
      const misfortune = character?.misfortune ?? 0;

      // Amarra: apply misfortune penalty to effective result for AI
      const effectiveResult = applyMisfortuneToRoll(result.total, misfortune);

      // Create system message for roll result (show misfortune if applied)
      const rollDisplay =
        misfortune > 0
          ? `🎲 Rolled ${result.notation}: ${result.breakdown} | ${t('misfortune.effectiveResult', { value: effectiveResult.toString() })}`
          : `🎲 Rolled ${result.notation}: ${result.breakdown}`;

      const rollMessage: NewMessage = {
        campaignId,
        role: 'system',
        content: rollDisplay,
      };

      const savedRollMessage = await messageRepo.createMessage(rollMessage);
      addMessage(savedRollMessage);

      // Decay misfortune on honest roll
      if (character && misfortune > 0) {
        const newMisfortune = Math.max(0, misfortune - MISFORTUNE_DECAY_PER_HONEST_ROLL);
        character = await characterRepo.updateCharacterMisfortune(character.id, newMisfortune);
        useCharacterStore.getState().setCharacter(character);
      }

      // 4. Start AI response
      setAIResponding(true);
      setStreamedContent('');
      setError(null);
      setPendingRoll(null);

      // Load context
      const recap = await recapRepo.getRecapByCampaign(campaignId) || null;
      const entities = await entityRepo.getEntitiesByCampaign(campaignId);
      const facts = await factRepo.getFactsByCampaign(campaignId);
      character = character ?? useCharacterStore.getState().character;

      // Include the action and roll in context
      const allMessages = [...messages, savedUserMessage, savedRollMessage];

      // Get AI response with streaming (use effective result for narrative)
      const response = await gameEngine.getAIResponseAfterRoll(
        {
          campaign,
          messages: allMessages,
          recap,
          entities,
          facts,
          character,
        },
        effectiveResult,
        result.notation,
        (chunk) => {
          appendStreamedContent(chunk);
        }
      );

      // If fallback was used, show offline notice
      if (response.usedFallback) {
        const offlineNotice: NewMessage = {
          campaignId,
          role: 'system',
          content: t('common.aiOfflineNotice'),
        };
        const savedNotice = await messageRepo.createMessage(offlineNotice);
        addMessage(savedNotice);
      }

      // Save AI message
      const aiMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: response.content,
      };

      const savedAIMessage = await messageRepo.createMessage(aiMessage);
      addMessage(savedAIMessage);

      // Handle character effects (HP damage/healing, resource spending/restoration)
      let characterDied = false;
      if (response.characterEffects && response.characterEffects.length > 0) {
        characterDied = await applyCharacterEffects(response.characterEffects, campaignId);
      }

      // Handle item drops
      if (response.itemDrops && response.itemDrops.length > 0) {
        await applyItemDrops(response.itemDrops, campaignId);
      }

      setAIResponding(false);
      setStreamedContent('');

      // If character died, generate death message and end campaign
      if (characterDied) {
        await handleCharacterDeath(campaignId);
        return; // Stop here, don't show suggested actions
      }

      // Store suggested actions from AI response
      setSuggestedActions(response.suggestedActions);

      // If AI requested another roll, set it as pending
      if (response.rollRequest) {
        setPendingRoll(response.rollRequest);
      }
    } catch (err) {
      setError((err as Error).message);
      setAIResponding(false);
      setStreamedContent('');
      throw err;
    }
  };

  /**
   * Send user message and get AI response
   */
  const sendMessage = async (content: string) => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    const campaign = getActiveCampaign();
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    try {
      // Create and save user message
      const userMessage: NewMessage = {
        campaignId,
        role: 'user',
        content,
      };

      const savedUserMessage = await messageRepo.createMessage(userMessage);
      addMessage(savedUserMessage);

      // Amarra: detect claimed roll in message, increment misfortune
      const claimedValue = detectClaimedRoll(content);
      let character = useCharacterStore.getState().character;
      if (claimedValue !== null && character) {
        const newMisfortune = Math.min(MISFORTUNE_MAX, (character.misfortune ?? 0) + 1);
        character = await characterRepo.updateCharacterMisfortune(character.id, newMisfortune);
        useCharacterStore.getState().setCharacter(character);

        const misfortuneNotice: NewMessage = {
          campaignId,
          role: 'system',
          content: t('misfortune.claimedRollNotice', { stacks: newMisfortune.toString() }),
        };
        const savedNotice = await messageRepo.createMessage(misfortuneNotice);
        addMessage(savedNotice);
      }

      // Start AI response
      setAIResponding(true);
      setStreamedContent('');
      setError(null);

      // Load context
      const recap = await recapRepo.getRecapByCampaign(campaignId) || null;
      const entities = await entityRepo.getEntitiesByCampaign(campaignId);
      const facts = await factRepo.getFactsByCampaign(campaignId);
      character = character ?? useCharacterStore.getState().character;

      // Get all messages including the one we just added
      const allMessages = [...messages, savedUserMessage];

      // Get AI response with streaming
      const response = await gameEngine.getAIResponse(
        {
          campaign,
          messages: allMessages,
          recap,
          entities,
          facts,
          character,
        },
        (chunk) => {
          appendStreamedContent(chunk);
        }
      );

      // If fallback was used, show offline notice
      if (response.usedFallback) {
        const offlineNotice: NewMessage = {
          campaignId,
          role: 'system',
          content: t('common.aiOfflineNotice'),
        };
        const savedNotice = await messageRepo.createMessage(offlineNotice);
        addMessage(savedNotice);
      }

      // Save AI message
      const aiMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: response.content,
      };

      const savedAIMessage = await messageRepo.createMessage(aiMessage);
      addMessage(savedAIMessage);

      // Handle character effects (HP damage/healing, resource spending/restoration)
      let characterDied = false;
      if (response.characterEffects && response.characterEffects.length > 0) {
        characterDied = await applyCharacterEffects(response.characterEffects, campaignId);
      }

      // Handle item drops
      if (response.itemDrops && response.itemDrops.length > 0) {
        await applyItemDrops(response.itemDrops, campaignId);
      }

      // If character died, generate death message and end campaign
      if (characterDied) {
        setAIResponding(false);
        setStreamedContent('');
        await handleCharacterDeath(campaignId);
        return;
      }

      // Handle XP change from AI (gain or loss per action)
      if (response.xpAward !== null && response.xpAward !== 0) {
        await applyXPChange(response.xpAward, campaignId, campaign.system);
      }

      setAIResponding(false);
      setStreamedContent('');

      // Store suggested actions from AI
      setSuggestedActions(response.suggestedActions);

      // If AI requested a roll, set it as pending
      if (response.rollRequest) {
        setPendingRoll(response.rollRequest);
      }
    } catch (err) {
      setError((err as Error).message);
      setAIResponding(false);
      setStreamedContent('');
      throw err;
    }
  };

  /**
   * Send AI response after a dice roll
   */
  const sendMessageAfterRoll = async (rollResult: number, rollNotation: string) => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    const campaign = getActiveCampaign();
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    try {
      setAIResponding(true);
      setStreamedContent('');
      setError(null);

      // Load context
      const recap = await recapRepo.getRecapByCampaign(campaignId) || null;
      const entities = await entityRepo.getEntitiesByCampaign(campaignId);
      const facts = await factRepo.getFactsByCampaign(campaignId);
      const character = useCharacterStore.getState().character;

      // Get AI response with streaming
      const response = await gameEngine.getAIResponseAfterRoll(
        {
          campaign,
          messages,
          recap,
          entities,
          facts,
          character,
        },
        rollResult,
        rollNotation,
        (chunk) => {
          appendStreamedContent(chunk);
        }
      );

      // If fallback was used, show offline notice
      if (response.usedFallback) {
        const offlineNotice: NewMessage = {
          campaignId,
          role: 'system',
          content: t('common.aiOfflineNotice'),
        };
        const savedNotice = await messageRepo.createMessage(offlineNotice);
        addMessage(savedNotice);
      }

      // Save AI message
      const aiMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: response.content,
      };

      const savedAIMessage = await messageRepo.createMessage(aiMessage);
      addMessage(savedAIMessage);

      // Handle character effects (HP damage/healing, resource spending/restoration)
      let characterDied = false;
      if (response.characterEffects && response.characterEffects.length > 0) {
        characterDied = await applyCharacterEffects(response.characterEffects, campaignId);
      }

      // Handle item drops
      if (response.itemDrops && response.itemDrops.length > 0) {
        await applyItemDrops(response.itemDrops, campaignId);
      }

      // If character died, generate death message and end campaign
      if (characterDied) {
        setAIResponding(false);
        setStreamedContent('');
        await handleCharacterDeath(campaignId);
        return;
      }

      // Handle XP change from AI (gain or loss per action)
      if (response.xpAward !== null && response.xpAward !== 0) {
        await applyXPChange(response.xpAward, campaignId, campaign.system);
      }

      setAIResponding(false);
      setStreamedContent('');

      // Store suggested actions from AI response
      setSuggestedActions(response.suggestedActions);

      // If AI requested another roll, set it as pending
      if (response.rollRequest) {
        setPendingRoll(response.rollRequest);
      }
    } catch (err) {
      setError((err as Error).message);
      setAIResponding(false);
      setStreamedContent('');
      throw err;
    }
  };

  /**
   * Start a new campaign with initial AI narration
   */
  const startCampaign = async () => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    const campaign = getActiveCampaign();
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    try {
      // Start AI response
      setAIResponding(true);
      setStreamedContent('');
      setError(null);

      // Load context (will be empty for new campaign)
      const recap = await recapRepo.getRecapByCampaign(campaignId) || null;
      const entities = await entityRepo.getEntitiesByCampaign(campaignId);
      const facts = await factRepo.getFactsByCampaign(campaignId);
      const character = useCharacterStore.getState().character;

      // Get initial AI response with streaming
      const response = await gameEngine.getAIResponse(
        {
          campaign,
          messages: [], // Empty messages for campaign start
          recap,
          entities,
          facts,
          character,
        },
        (chunk) => {
          appendStreamedContent(chunk);
        }
      );

      // If fallback was used, show offline notice
      if (response.usedFallback) {
        const offlineNotice: NewMessage = {
          campaignId,
          role: 'system',
          content: t('common.aiOfflineNotice'),
        };
        const savedNotice = await messageRepo.createMessage(offlineNotice);
        addMessage(savedNotice);
      }

      // Save AI message
      const aiMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: response.content,
      };

      const savedAIMessage = await messageRepo.createMessage(aiMessage);
      addMessage(savedAIMessage);

      // Handle character effects (HP damage/healing, resource spending/restoration)
      let characterDied = false;
      if (response.characterEffects && response.characterEffects.length > 0) {
        characterDied = await applyCharacterEffects(response.characterEffects, campaignId);
      }

      // Handle item drops
      if (response.itemDrops && response.itemDrops.length > 0) {
        await applyItemDrops(response.itemDrops, campaignId);
      }

      // If character died, generate death message and end campaign
      if (characterDied) {
        setAIResponding(false);
        setStreamedContent('');
        await handleCharacterDeath(campaignId);
        return;
      }

      // Handle XP change from AI (gain or loss per action)
      if (response.xpAward !== null && response.xpAward !== 0) {
        await applyXPChange(response.xpAward, campaignId, campaign.system);
      }

      setAIResponding(false);
      setStreamedContent('');

      // Store suggested actions from AI
      setSuggestedActions(response.suggestedActions);

      // If AI requested a roll, set it as pending
      if (response.rollRequest) {
        setPendingRoll(response.rollRequest);
      }
    } catch (err) {
      console.error('Error starting campaign:', err);
      setError((err as Error).message);
      setAIResponding(false);
      setStreamedContent('');

      // Provide fallback opening narration for first message
      const fallbackContent = t('campaign.startFallback', {
        theme: campaign.theme,
        tone: campaign.tone,
        system: campaign.system,
      });

      const fallbackMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: fallbackContent,
      };

      const savedFallback = await messageRepo.createMessage(fallbackMessage);
      addMessage(savedFallback);

      // Show error notice
      const errorNotice: NewMessage = {
        campaignId,
        role: 'system',
        content: t('common.aiErrorNotice'),
      };
      const savedNotice = await messageRepo.createMessage(errorNotice);
      addMessage(savedNotice);

      // Clear error state so user can continue
      setError(null);
    }
  };

  /**
   * Resend a message by clearing all subsequent messages and re-sending it
   */
  const resendMessage = async (messageContent: string) => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    try {
      // Find the message with this content (last occurrence)
      const messageToResend = messages
        .filter(m => m.role === 'user' && m.content === messageContent)
        .pop();

      if (!messageToResend) {
        console.warn('Message to resend not found');
        return;
      }

      // Delete all messages and rolls created after this message from database
      await deleteMessagesAfterTimestamp(campaignId, messageToResend.createdAt);
      await deleteRollsAfterTimestamp(campaignId, messageToResend.createdAt);

      // Update store to remove messages after this one
      removeMessagesAfter(messageToResend.id);

      // Note: Rolls are also deleted from the database above
      // The UI will reload them on next refresh

      // Now send the message again
      await sendMessageOrRoll(messageContent);
    } catch (err) {
      console.error('Error resending message:', err);
      setError((err as Error).message);
      throw err;
    }
  };

  /**
   * Continue narration - asks AI to continue from where it stopped
   */
  const continueNarration = async () => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    try {
      // Send a special message asking AI to continue
      await sendMessageOrRoll('[Continue the narration]');
    } catch (err) {
      console.error('Error continuing narration:', err);
      setError((err as Error).message);
      throw err;
    }
  };

  return {
    sendMessage: sendMessageOrRoll, // Use the new function that detects dice notation
    sendMessageAfterRoll,
    sendActionWithRoll, // New function for actions with rolls
    startCampaign,
    resendMessage,
    continueNarration,
  };
}
