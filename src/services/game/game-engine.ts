import { getClaudeClient } from '../ai/claude-client';
import { getGeminiClient } from '../ai/gemini-client';
import { buildSystemPrompt } from '../ai/prompt-builder';
import { assembleContext, parseRollRequest, parseSuggestedActions, parseXPAward, parseCharacterEffects, parseItemDrops, type CharacterEffect, type ItemDrop } from '../ai/context-assembler';
import { getAIProvider } from '../storage/api-key-storage';
import { getCurrentLanguage } from '../i18n/use-i18n';
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
  itemDrops: ItemDrop[];
  usedFallback?: boolean; // True if AI was unavailable and fallback was used
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
   * Generate fallback response when AI is unavailable
   */
  private generateFallbackResponse(language: string): AIResponse {
    const fallbackMessages = {
      en: "The adventure continues, though the path ahead is uncertain. Take a moment to consider your next move carefully.",
      pt: "A aventura continua, embora o caminho à frente seja incerto. Reserve um momento para considerar cuidadosamente seu próximo movimento.",
      es: "La aventura continúa, aunque el camino por delante es incierto. Tómate un momento para considerar cuidadosamente tu próximo movimiento.",
    };

    return {
      content: fallbackMessages[language as keyof typeof fallbackMessages] || fallbackMessages.en,
      rollRequest: null,
      suggestedActions: [],
      xpAward: null,
      characterEffects: [],
      itemDrops: [],
      usedFallback: true,
    };
  }

  /**
   * Get AI response for player action
   */
  async getAIResponse(
    context: GameEngineContext,
    onChunk: (text: string) => void
  ): Promise<AIResponse> {
    try {
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

      // Parse item drops
      const { cleanContent: contentAfterDrops, drops } = parseItemDrops(contentAfterEffects);

      // Parse suggested actions
      const { cleanContent, actions } = parseSuggestedActions(contentAfterDrops);

      console.log('[GameEngine] Raw AI content:', rawContent);
      console.log('[GameEngine] Content after parsing:', cleanContent);
      console.log('[GameEngine] Parsed suggested actions:', actions);

      // Check if AI is requesting a roll
      const rollRequest = parseRollRequest(cleanContent);

      return {
        content: cleanContent,
        rollRequest,
        suggestedActions: actions,
        xpAward: xpAmount,
        characterEffects: effects,
        itemDrops: drops,
      };
    } catch (error) {
      console.error('AI response failed, using fallback:', error);
      const language = getCurrentLanguage();
      const fallbackResponse = this.generateFallbackResponse(language);

      // Still call onChunk with fallback content so UI updates
      onChunk(fallbackResponse.content);

      return fallbackResponse;
    }
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
    try {
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

      // Parse item drops
      const { cleanContent: contentAfterDrops, drops } = parseItemDrops(contentAfterEffects);

      // Parse suggested actions
      const { cleanContent, actions } = parseSuggestedActions(contentAfterDrops);

      // Check if AI is requesting another roll
      const rollRequest = parseRollRequest(cleanContent);

      return {
        content: cleanContent,
        rollRequest,
        suggestedActions: actions,
        xpAward: xpAmount,
        characterEffects: effects,
        itemDrops: drops,
      };
    } catch (error) {
      console.error('AI response after roll failed, using fallback:', error);
      const language = getCurrentLanguage();

      // Generate language-specific fallback based on roll result
      const fallbackMessages = {
        en: rollResult >= 15
          ? `Your roll of ${rollResult} proves successful! The action plays out favorably. What do you do next?`
          : rollResult >= 10
          ? `Your roll of ${rollResult} yields mixed results. The situation is uncertain. What do you do?`
          : `Your roll of ${rollResult} falls short. Things don't go as planned. What do you do?`,
        pt: rollResult >= 15
          ? `Seu resultado de ${rollResult} foi bem-sucedido! A ação se desenrola favoravelmente. O que você faz a seguir?`
          : rollResult >= 10
          ? `Seu resultado de ${rollResult} teve resultados mistos. A situação é incerta. O que você faz?`
          : `Seu resultado de ${rollResult} ficou aquém. As coisas não saem como planejado. O que você faz?`,
        es: rollResult >= 15
          ? `¡Tu tirada de ${rollResult} tiene éxito! La acción se desarrolla favorablemente. ¿Qué haces a continuación?`
          : rollResult >= 10
          ? `Tu tirada de ${rollResult} tiene resultados mixtos. La situación es incierta. ¿Qué haces?`
          : `Tu tirada de ${rollResult} se queda corta. Las cosas no salen como estaba planeado. ¿Qué haces?`,
      };

      const fallbackContent = fallbackMessages[language as keyof typeof fallbackMessages] || fallbackMessages.en;

      // Call onChunk so UI updates
      onChunk(fallbackContent);

      return {
        content: fallbackContent,
        rollRequest: null,
        suggestedActions: [],
        xpAward: null,
        characterEffects: [],
        itemDrops: [],
        usedFallback: true,
      };
    }
  }

  /**
   * Generate fallback character background when AI is unavailable
   */
  private generateFallbackBackground(
    characterName: string,
    campaignTheme: string,
    _campaignSystem: string,
    language: string
  ): {
    backstory: string;
    personality: string;
    goals: string;
    fears: string;
  } {
    // Language-specific templates
    const templates = {
      en: {
        backstory: `${characterName} is an adventurer shaped by the harsh realities of ${campaignTheme}. Their past is marked by trials that forged their determination and resolve.`,
        personality: 'determined, resourceful, cautious, curious',
        goals: `${characterName} seeks to prove themselves in this world and uncover the mysteries of ${campaignTheme}.`,
        fears: `${characterName} fears failure and the unknown dangers that lurk in the shadows of this realm.`,
      },
      pt: {
        backstory: `${characterName} é um aventureiro moldado pelas duras realidades de ${campaignTheme}. Seu passado é marcado por provações que forjaram sua determinação e resolução.`,
        personality: 'determinado, engenhoso, cauteloso, curioso',
        goals: `${characterName} busca provar seu valor neste mundo e desvendar os mistérios de ${campaignTheme}.`,
        fears: `${characterName} teme o fracasso e os perigos desconhecidos que espreitam nas sombras deste reino.`,
      },
      es: {
        backstory: `${characterName} es un aventurero moldeado por las duras realidades de ${campaignTheme}. Su pasado está marcado por pruebas que forjaron su determinación y resolución.`,
        personality: 'determinado, ingenioso, cauteloso, curioso',
        goals: `${characterName} busca demostrar su valía en este mundo y descubrir los misterios de ${campaignTheme}.`,
        fears: `${characterName} teme el fracaso y los peligros desconocidos que acechan en las sombras de este reino.`,
      },
    };

    return templates[language as keyof typeof templates] || templates.en;
  }

  /**
   * Generate character background with AI
   */
  async generateCharacterBackground(
    characterName: string,
    campaignTheme: string,
    campaignSystem: string,
    attributes: Record<string, number>
  ): Promise<{
    backstory: string;
    personality: string;
    goals: string;
    fears: string;
  }> {
    // Get current language
    const language = getCurrentLanguage();
    const languageMap: Record<string, string> = {
      'en': 'English',
      'pt': 'Portuguese',
      'es': 'Spanish',
    };
    const languageName = languageMap[language] || 'English';

    try {
      // Build attribute summary
      const attrSummary = Object.entries(attributes)
        .map(([name, value]) => `${name}: ${value}`)
        .join(', ');

      const systemPrompt = `You are a creative assistant helping to create compelling characters for tabletop RPG campaigns. You generate backstories, personalities, goals, and fears that fit the campaign's theme and system. You MUST respond in ${languageName}.`;

      const userPrompt = `Create a character background for a ${campaignSystem} campaign.

Campaign Theme: ${campaignTheme}
Character Name: ${characterName}
Attributes: ${attrSummary}

Generate a compelling character background with the following elements:

1. **Backstory** (2-3 sentences): Who is this character? Where do they come from? What shaped them?

2. **Personality** (3-5 traits): Core personality traits as comma-separated adjectives (e.g., "brave, curious, reckless, compassionate")

3. **Goals** (1-2 sentences): What does this character want to achieve? What drives them forward?

4. **Fears** (1-2 sentences): What does this character fear? What holds them back?

Important:
- Write EVERYTHING in ${languageName}
- Match the tone and theme of the campaign (${campaignTheme})
- Consider the character's attributes when creating personality
- Keep responses concise and evocative
- Avoid clichés, make it interesting and unique
- Return ONLY a JSON object with this exact structure (no markdown, no extra text):

{
  "backstory": "...",
  "personality": "...",
  "goals": "...",
  "fears": "..."
}`;

      const client = this.getClient();
      const response = await client.sendMessageSync(
        systemPrompt,
        [{ role: 'user', content: userPrompt }]
      );

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('AI response format invalid, using fallback');
        return this.generateFallbackBackground(characterName, campaignTheme, campaignSystem, language);
      }

      const background = JSON.parse(jsonMatch[0]);

      // Validate response has all required fields
      if (!background.backstory || !background.personality || !background.goals || !background.fears) {
        console.warn('AI response incomplete, using fallback');
        return this.generateFallbackBackground(characterName, campaignTheme, campaignSystem, language);
      }

      return background;
    } catch (error) {
      console.error('AI character generation failed, using fallback:', error);
      return this.generateFallbackBackground(characterName, campaignTheme, campaignSystem, language);
    }
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
