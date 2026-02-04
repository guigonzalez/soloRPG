import { getClaudeClient } from '../ai/claude-client';
import { getGeminiClient } from '../ai/gemini-client';
import { buildSystemPrompt } from '../ai/prompt-builder';
import { assembleContext, parseRollRequest, parseSuggestedActions, parseXPAward, parseCharacterEffects, type CharacterEffect } from '../ai/context-assembler';
import { getAIProvider } from '../storage/api-key-storage';
import type { Campaign, Message, Entity, Fact, Recap, SuggestedAction, Character } from '../../types/models';
import type { ClaudeMessage } from '../../types/api';

export interface GameEngineContext {
  campaign: Campaign;
  messages: Message[];
  recap: Recap | null;
  entities: Entity[];
  facts: Fact[];
  character: Character | null;
}

export interface AIResponse {
  content: string;
  rollRequest: string | null;
  suggestedActions: SuggestedAction[];
  xpAward: number | null;
  characterEffects: CharacterEffect[];
}

/**
 * AI Client interface
 */
interface AIClient {
  sendMessage(
    systemPrompt: string,
    messages: ClaudeMessage[],
    onChunk: (text: string) => void
  ): Promise<string>;
  sendMessageSync(
    systemPrompt: string,
    messages: ClaudeMessage[]
  ): Promise<string>;
}

/**
 * Game Engine - Orchestrates AI responses
 */
export class GameEngine {
  private getClient(): AIClient {
    const provider = getAIProvider();
    return provider === 'gemini' ? getGeminiClient() : getClaudeClient();
  }

  /**
   * Get AI response for player action
   */
  async getAIResponse(
    context: GameEngineContext,
    onChunk: (text: string) => void
  ): Promise<AIResponse> {
    // Build system prompt with CERTA model
    const systemPrompt = buildSystemPrompt(
      context.campaign,
      context.recap,
      context.entities,
      context.facts,
      context.character
    );

    // Assemble conversation context
    const claudeMessages = assembleContext(context.messages);

    // Get streaming response from AI
    const client = this.getClient();
    const rawContent = await client.sendMessage(
      systemPrompt,
      claudeMessages,
      onChunk
    );

    // Parse XP award first
    const { cleanContent: contentAfterXP, xpAmount } = parseXPAward(rawContent);

    // Parse character effects (HP damage/healing, resource spending/restoration)
    const { cleanContent: contentAfterEffects, effects } = parseCharacterEffects(contentAfterXP);

    // Parse suggested actions
    const { cleanContent, actions } = parseSuggestedActions(contentAfterEffects);

    // Check if AI is requesting a roll
    const rollRequest = parseRollRequest(cleanContent);

    return {
      content: cleanContent,
      rollRequest,
      suggestedActions: actions,
      xpAward: xpAmount,
      characterEffects: effects,
    };
  }

  /**
   * Get AI response after a dice roll
   */
  async getAIResponseAfterRoll(
    context: GameEngineContext,
    rollResult: number,
    rollNotation: string,
    onChunk: (text: string) => void
  ): Promise<AIResponse> {
    // Add a system message about the roll result to context
    const messagesWithRoll: Message[] = [
      ...context.messages,
      {
        id: 'temp-roll-result',
        campaignId: context.campaign.id,
        role: 'system',
        content: `[Player rolled ${rollNotation} and got ${rollResult}]`,
        createdAt: Date.now(),
      },
    ];

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      context.campaign,
      context.recap,
      context.entities,
      context.facts,
      context.character
    );

    // Add instruction to respond to the roll
    const systemPromptWithRollInstruction = systemPrompt + `\n\n# CURRENT TASK

The player just rolled ${rollNotation} and got ${rollResult}.

Interpret this result in the context of their action and continue the story. Describe what happens based on the roll result. If it was a success, describe how they succeed. If it was a failure or mixed result, describe the consequences.

Then present the new situation and ask "What do you do?"`;

    // Assemble context
    const claudeMessages = assembleContext(messagesWithRoll);

    // Get response from AI
    const client = this.getClient();
    const rawContent = await client.sendMessage(
      systemPromptWithRollInstruction,
      claudeMessages,
      onChunk
    );

    // Parse XP award first
    const { cleanContent: contentAfterXP, xpAmount } = parseXPAward(rawContent);

    // Parse character effects (HP damage/healing, resource spending/restoration)
    const { cleanContent: contentAfterEffects, effects } = parseCharacterEffects(contentAfterXP);

    // Parse suggested actions
    const { cleanContent, actions } = parseSuggestedActions(contentAfterEffects);

    // Check if AI is requesting another roll
    const rollRequest = parseRollRequest(cleanContent);

    return {
      content: cleanContent,
      rollRequest,
      suggestedActions: actions,
      xpAward: xpAmount,
      characterEffects: effects,
    };
  }
}

// Singleton instance
let gameEngineInstance: GameEngine | null = null;

export function getGameEngine(): GameEngine {
  if (!gameEngineInstance) {
    gameEngineInstance = new GameEngine();
  }
  return gameEngineInstance;
}
