import { getClaudeClient } from './claude-client';
import { getGeminiClient } from './gemini-client';
import { getAIProvider } from '../storage/api-key-storage';
import { getLanguage, getLanguageName } from '../storage/settings-storage';

/**
 * Campaign suggestion result
 */
export interface CampaignSuggestion {
  title: string;
  theme: string;
  tone: string;
}

/**
 * Generate campaign suggestions based on RPG system
 */
export async function generateCampaignSuggestion(
  system: string
): Promise<CampaignSuggestion> {
  const provider = getAIProvider();
  const language = getLanguage();
  const languageName = getLanguageName(language);

  // Get appropriate client
  const client = provider === 'gemini' ? getGeminiClient() : getClaudeClient();

  const systemPrompt = `You are a creative RPG campaign designer.

IMPORTANT: You MUST generate the campaign in ${languageName}. Title, theme, and tone must all be in ${languageName}.

Your task is to generate an exciting campaign idea for ${system}.

Generate ONE unique campaign concept that fits the system's themes and mechanics.

RULES:
- Be creative and original
- Make it exciting and engaging
- Keep it concise
- Match the system's typical themes and tone
- Title should be catchy (max 60 characters)
- Theme should describe the setting and key elements (max 180 characters)
- Tone should be 1-3 words describing the mood
- ALL content must be in ${languageName}

OUTPUT FORMAT - Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Campaign Title in ${languageName}",
  "theme": "Description of setting, world, and key story elements in ${languageName}",
  "tone": "Mood descriptor in ${languageName}"
}

IMPORTANT: Return ONLY the JSON object, nothing else. Do not wrap it in code blocks or markdown.`;

  try {
    const response = await client.sendMessageSync(
      systemPrompt,
      [{ role: 'user', content: `Generate a campaign idea for ${system}` }]
    );

    // Parse JSON response - handle markdown code blocks
    let jsonText = response;

    // Remove markdown code block markers if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', response);
      throw new Error('Failed to extract JSON from AI response');
    }

    const suggestion: CampaignSuggestion = JSON.parse(jsonMatch[0]);

    // Validate and truncate if needed
    if (suggestion.title && suggestion.title.length > 60) {
      suggestion.title = suggestion.title.substring(0, 57) + '...';
    }
    if (suggestion.theme && suggestion.theme.length > 180) {
      suggestion.theme = suggestion.theme.substring(0, 177) + '...';
    }

    return suggestion;
  } catch (error) {
    console.error('Campaign generation failed:', error);
    // Return fallback suggestion
    return getFallbackSuggestion(system);
  }
}

/**
 * Get fallback suggestion if AI generation fails
 */
function getFallbackSuggestion(system: string): CampaignSuggestion {
  const fallbacks: Record<string, CampaignSuggestion> = {
    'D&D 5e': {
      title: 'The Forgotten Ruins',
      theme: 'Ancient dungeons hide secrets of a lost civilization. Magic runs wild, and dark forces stir beneath the earth.',
      tone: 'Heroic, adventurous'
    },
    'Pathfinder 2e': {
      title: 'Crown of Shadows',
      theme: 'A cursed kingdom needs heroes to break an ancient curse. Political intrigue meets dungeon exploration.',
      tone: 'Epic, mysterious'
    },
    'Call of Cthulhu': {
      title: 'The Arkham Files',
      theme: 'Strange disappearances in 1920s New England lead to eldritch horrors and cosmic truths beyond comprehension.',
      tone: 'Horror, investigative'
    },
    'Cyberpunk RED': {
      title: 'Neon Ghosts',
      theme: 'Corporate espionage in Night City. Hackers, mercs, and rebels fight for survival in the chrome and shadows.',
      tone: 'Gritty, noir'
    },
    'Vampire: The Masquerade': {
      title: 'Blood and Politics',
      theme: 'Navigate vampire society politics while maintaining the Masquerade. Ancient bloodlines clash in modern nights.',
      tone: 'Dark, intrigue'
    },
    'Generic/Freeform': {
      title: 'The Journey Begins',
      theme: 'A classic adventure awaits. Heroes rise, challenges appear, and destinies are forged.',
      tone: 'Adventurous'
    }
  };

  return fallbacks[system] || fallbacks['Generic/Freeform'];
}
