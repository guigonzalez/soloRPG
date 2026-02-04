import { useChatStore } from '../store/chat-store';
import { useCampaignStore } from '../store/campaign-store';
import { useCharacterStore } from '../store/character-store';
import { getGameEngine } from '../services/game/game-engine';
import * as messageRepo from '../services/storage/message-repo';
import * as recapRepo from '../services/storage/recap-repo';
import * as entityRepo from '../services/storage/entity-repo';
import * as factRepo from '../services/storage/fact-repo';
import * as rollRepo from '../services/storage/roll-repo';
import { isValidDiceNotation } from '../services/dice/dice-parser';
import { rollDice } from '../services/dice/dice-roller';
import { calculateRollXP } from '../services/game/experience-calculator';
import { t } from '../services/i18n/use-i18n';
import type { CharacterEffect } from '../services/ai/context-assembler';
import type { NewMessage } from '../types/models';

/**
 * Hook to manage AI interactions using real Claude API
 */
export function useAI(campaignId: string | null) {
  const { messages, addMessage, setAIResponding, setStreamedContent, appendStreamedContent, setError, setPendingRoll, setSuggestedActions } = useChatStore();
  const { getActiveCampaign } = useCampaignStore();
  const gameEngine = getGameEngine();

  /**
   * Apply character effects (HP damage/healing, resource spending/restoration)
   */
  const applyCharacterEffects = async (effects: CharacterEffect[], campaignId: string) => {
    const characterStore = useCharacterStore.getState();

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

      // 2. Roll the dice
      const result = rollDice(rollNotation);

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

      // Save AI message
      const aiMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: response.content,
      };

      const savedAIMessage = await messageRepo.createMessage(aiMessage);
      addMessage(savedAIMessage);

      // Handle character effects (HP damage/healing, resource spending/restoration)
      if (response.characterEffects && response.characterEffects.length > 0) {
        await applyCharacterEffects(response.characterEffects, campaignId);
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

      // Save AI message
      const aiMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: response.content,
      };

      const savedAIMessage = await messageRepo.createMessage(aiMessage);
      addMessage(savedAIMessage);

      // Handle character effects (HP damage/healing, resource spending/restoration)
      if (response.characterEffects && response.characterEffects.length > 0) {
        await applyCharacterEffects(response.characterEffects, campaignId);
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

      // Save AI message
      const aiMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: response.content,
      };

      const savedAIMessage = await messageRepo.createMessage(aiMessage);
      addMessage(savedAIMessage);

      // Handle character effects (HP damage/healing, resource spending/restoration)
      if (response.characterEffects && response.characterEffects.length > 0) {
        await applyCharacterEffects(response.characterEffects, campaignId);
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

      // Save AI message
      const aiMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: response.content,
      };

      const savedAIMessage = await messageRepo.createMessage(aiMessage);
      addMessage(savedAIMessage);

      // Handle character effects (HP damage/healing, resource spending/restoration)
      if (response.characterEffects && response.characterEffects.length > 0) {
        await applyCharacterEffects(response.characterEffects, campaignId);
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

  return {
    sendMessage: sendMessageOrRoll, // Use the new function that detects dice notation
    sendMessageAfterRoll,
    sendActionWithRoll, // New function for actions with rolls
    startCampaign,
  };
}
