import { useChatStore } from '../store/chat-store';
import { useCampaignStore } from '../store/campaign-store';
import { useCharacterStore } from '../store/character-store';
import { getGameEngine } from '../services/game/game-engine';
import * as messageRepo from '../services/storage/message-repo';
import * as recapRepo from '../services/storage/recap-repo';
import * as entityRepo from '../services/storage/entity-repo';
import * as factRepo from '../services/storage/fact-repo';
import * as rollRepo from '../services/storage/roll-repo';
import { deleteMessagesAfterTimestamp } from '../services/storage/message-repo';
import { deleteRollsAfterTimestamp } from '../services/storage/roll-repo';
import { isValidDiceNotation } from '../services/dice/dice-parser';
import { rollDice } from '../services/dice/dice-roller';
import { calculateRollXP } from '../services/game/experience-calculator';
import { getSystemTemplate } from '../services/game/attribute-templates';
import { t } from '../services/i18n/use-i18n';
import type { CharacterEffect } from '../services/ai/context-assembler';
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

    for (const effect of effects) {
      try {
        switch (effect.type) {
          case 'damage': {
            await characterStore.takeDamage(effect.amount);

            // Show damage message in chat
            const damageMessage: NewMessage = {
              campaignId,
              role: 'system',
              content: t('combat.takeDamage', { amount: effect.amount.toString() }),
            };
            const savedDamageMessage = await messageRepo.createMessage(damageMessage);
            addMessage(savedDamageMessage);

            // Check if character died
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

          case 'spend_resource': {
            if (effect.resourceName) {
              await characterStore.updateResource(effect.resourceName, effect.amount);

              // Show resource spent message in chat
              const spendMessage: NewMessage = {
                campaignId,
                role: 'system',
                content: t('combat.resourceSpent', {
                  resource: effect.resourceName,
                  amount: effect.amount.toString(),
                  spent: Math.abs(effect.amount).toString()
                }),
              };
              const savedSpendMessage = await messageRepo.createMessage(spendMessage);
              addMessage(savedSpendMessage);
            }
            break;
          }

          case 'restore_resource': {
            if (effect.resourceName) {
              await characterStore.restoreResource(effect.resourceName, effect.amount);

              // Show resource restored message in chat
              const restoreMessage: NewMessage = {
                campaignId,
                role: 'system',
                content: t('combat.resourceRestored', {
                  resource: effect.resourceName,
                  amount: effect.amount.toString()
                }),
              };
              const savedRestoreMessage = await messageRepo.createMessage(restoreMessage);
              addMessage(savedRestoreMessage);
            }
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

      // Create system message for roll result
      const rollMessage: NewMessage = {
        campaignId,
        role: 'system',
        content: `🎲 Rolled ${result.notation}: ${result.breakdown}`,
      };

      const savedRollMessage = await messageRepo.createMessage(rollMessage);
      addMessage(savedRollMessage);

      // Clear any pending roll
      setPendingRoll(null);

      // Send result to AI for narrative continuation
      await sendMessageAfterRoll(result.total, result.notation);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  /**
   * Resolve attribute modifiers in dice notation (e.g., "1d20+STR" -> "1d20+2")
   */
  const resolveAttributeModifiers = (notation: string): string => {
    const character = useCharacterStore.getState().character;
    if (!character) return notation;

    const campaign = getActiveCampaign();
    if (!campaign) return notation;

    // Use the imported getSystemTemplate function
    const template = getSystemTemplate(campaign.system);

    // Find attribute names in the notation (e.g., +STR, +DEX)
    const attrRegex = /([+-])([A-Z]{3})/g;
    let resolvedNotation = notation;

    const matches = [...notation.matchAll(attrRegex)];
    for (const match of matches) {
      const sign = match[1];
      const attrAbbr = match[2];

      // Find the attribute definition
      const attrDef = template.attributes.find(
        (a: any) => a.displayName.toUpperCase() === attrAbbr
      );

      if (attrDef) {
        const attrValue = character.attributes[attrDef.name] || 0;
        const modifier = template.modifierCalculation
          ? template.modifierCalculation(attrValue)
          : 0;

        // Replace the attribute abbreviation with the modifier value
        resolvedNotation = resolvedNotation.replace(
          `${sign}${attrAbbr}`,
          modifier >= 0 ? `+${modifier}` : `${modifier}`
        );
      }
    }

    return resolvedNotation;
  };

  /**
   * Send action with automatic roll
   * Used when player selects a suggested action that requires a roll
   */
  const sendActionWithRoll = async (actionText: string, rollNotation: string, dc?: number) => {
    if (!campaignId) {
      throw new Error('No active campaign');
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

      // Create system message for roll result
      const rollMessage: NewMessage = {
        campaignId,
        role: 'system',
        content: `🎲 Rolled ${result.notation}: ${result.breakdown}`,
      };

      const savedRollMessage = await messageRepo.createMessage(rollMessage);
      addMessage(savedRollMessage);

      // 3. Check for natural 20 (critical success)
      const isNaturalCrit = result.rolls.length === 1 && result.rolls[0] === 20;

      // 4. Award XP if roll was successful
      const xpAward = calculateRollXP(result.total, dc, isNaturalCrit);
      if (xpAward) {
        // Update character XP
        const levelUpResult = await useCharacterStore.getState().updateExperience(xpAward.amount, campaign.system);

        // Show XP gain in chat
        const xpMessage: NewMessage = {
          campaignId,
          role: 'system',
          content: `✨ +${xpAward.amount} XP - ${xpAward.reason}`,
        };

        const savedXPMessage = await messageRepo.createMessage(xpMessage);
        addMessage(savedXPMessage);

        // Handle level up
        if (levelUpResult.leveledUp) {
          const levelUpMessage: NewMessage = {
            campaignId,
            role: 'system',
            content: `🎉 LEVEL UP! You are now Level ${levelUpResult.newLevel}!`,
          };

          const savedLevelUpMessage = await messageRepo.createMessage(levelUpMessage);
          addMessage(savedLevelUpMessage);
        }
      }

      // 3. Start AI response
      setAIResponding(true);
      setStreamedContent('');
      setError(null);
      setPendingRoll(null);

      // Load context
      const recap = await recapRepo.getRecapByCampaign(campaignId) || null;
      const entities = await entityRepo.getEntitiesByCampaign(campaignId);
      const facts = await factRepo.getFactsByCampaign(campaignId);
      const character = useCharacterStore.getState().character;

      // Include the action and roll in context
      const allMessages = [...messages, savedUserMessage, savedRollMessage];

      // Get AI response with streaming
      const response = await gameEngine.getAIResponseAfterRoll(
        {
          campaign,
          messages: allMessages,
          recap,
          entities,
          facts,
          character,
        },
        result.total,
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

      // Start AI response
      setAIResponding(true);
      setStreamedContent('');
      setError(null);

      // Load context
      const recap = await recapRepo.getRecapByCampaign(campaignId) || null;
      const entities = await entityRepo.getEntitiesByCampaign(campaignId);
      const facts = await factRepo.getFactsByCampaign(campaignId);
      const character = useCharacterStore.getState().character;

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

      // If character died, generate death message and end campaign
      if (characterDied) {
        setAIResponding(false);
        setStreamedContent('');
        await handleCharacterDeath(campaignId);
        return;
      }

      // Handle XP award from AI (story progression, milestones, etc.)
      if (response.xpAward) {
        const levelUpResult = await useCharacterStore.getState().updateExperience(response.xpAward, campaign.system);

        // Show XP gain in chat
        const xpMessage: NewMessage = {
          campaignId,
          role: 'system',
          content: `✨ +${response.xpAward} XP - Story progression`,
        };

        const savedXPMessage = await messageRepo.createMessage(xpMessage);
        addMessage(savedXPMessage);

        // Handle level up
        if (levelUpResult.leveledUp) {
          const levelUpMessage: NewMessage = {
            campaignId,
            role: 'system',
            content: `🎉 LEVEL UP! You are now Level ${levelUpResult.newLevel}!`,
          };

          const savedLevelUpMessage = await messageRepo.createMessage(levelUpMessage);
          addMessage(savedLevelUpMessage);
        }
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

      // If character died, generate death message and end campaign
      if (characterDied) {
        setAIResponding(false);
        setStreamedContent('');
        await handleCharacterDeath(campaignId);
        return;
      }

      // Handle XP award from AI (story progression, milestones, etc.)
      if (response.xpAward) {
        const levelUpResult = await useCharacterStore.getState().updateExperience(response.xpAward, campaign.system);

        // Show XP gain in chat
        const xpMessage: NewMessage = {
          campaignId,
          role: 'system',
          content: `✨ +${response.xpAward} XP - Story progression`,
        };

        const savedXPMessage = await messageRepo.createMessage(xpMessage);
        addMessage(savedXPMessage);

        // Handle level up
        if (levelUpResult.leveledUp) {
          const levelUpMessage: NewMessage = {
            campaignId,
            role: 'system',
            content: `🎉 LEVEL UP! You are now Level ${levelUpResult.newLevel}!`,
          };

          const savedLevelUpMessage = await messageRepo.createMessage(levelUpMessage);
          addMessage(savedLevelUpMessage);
        }
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

      // If character died, generate death message and end campaign
      if (characterDied) {
        setAIResponding(false);
        setStreamedContent('');
        await handleCharacterDeath(campaignId);
        return;
      }

      // Handle XP award from AI (story progression, milestones, etc.)
      if (response.xpAward) {
        const levelUpResult = await useCharacterStore.getState().updateExperience(response.xpAward, campaign.system);

        // Show XP gain in chat
        const xpMessage: NewMessage = {
          campaignId,
          role: 'system',
          content: `✨ +${response.xpAward} XP - Story progression`,
        };

        const savedXPMessage = await messageRepo.createMessage(xpMessage);
        addMessage(savedXPMessage);

        // Handle level up
        if (levelUpResult.leveledUp) {
          const levelUpMessage: NewMessage = {
            campaignId,
            role: 'system',
            content: `🎉 LEVEL UP! You are now Level ${levelUpResult.newLevel}!`,
          };

          const savedLevelUpMessage = await messageRepo.createMessage(levelUpMessage);
          addMessage(savedLevelUpMessage);
        }
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
