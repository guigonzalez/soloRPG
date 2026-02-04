import type { Campaign, Entity, Fact, Recap, Character } from '../../types/models';
import { getLanguage, getLanguageName } from '../storage/settings-storage';
import { getSystemTemplate } from '../game/attribute-templates';

/**
 * Get system-specific guidance for difficulty checks
 */
function getSystemGuidance(system: string): string {
  const systemGuidance: Record<string, string> = {
    'D&D 5e': '- DC 10 = easy, DC 15 = moderate, DC 20 = hard, DC 25 = very hard\n   - Use d20 for most checks, suggest advantage/disadvantage when appropriate',
    'Pathfinder 2e': '- DC 15 = easy, DC 20 = moderate, DC 25 = hard, DC 30 = very hard\n   - Use d20 for checks, consider degrees of success/failure',
    'Call of Cthulhu': '- Use percentile difficulty (e.g., "Roll Investigation")\n   - Emphasize horror, investigation, and sanity',
    'Cyberpunk RED': '- DV 13 = everyday, DV 15 = professional, DV 17 = difficult, DV 21 = very difficult\n   - Focus on gritty cyberpunk themes',
    'Vampire: The Masquerade': '- Difficulty 6+ = routine, 7+ = challenging, 8+ = difficult\n   - Emphasize personal horror and political intrigue',
    'Fate Core': '- Use Fate ladder (Fair +2, Good +3, Great +4)\n   - Encourage creative aspects and narrative outcomes',
    'Powered by the Apocalypse': '- 10+ = success, 7-9 = partial success, 6- = failure with complication\n   - Focus on dramatic consequences and player choices',
    'OSR (Old School Renaissance)': '- Simple target numbers and saving throws\n   - Emphasize player skill, exploration, and deadly consequences',
    'Generic/Freeform': '- DC 10 = moderate, DC 15 = hard, DC 20 = very hard\n   - Adapt to the narrative style',
    'Other': '- DC 10 = moderate, DC 15 = hard, DC 20 = very hard\n   - Adapt to the narrative style'
  };

  return systemGuidance[system] || systemGuidance['Generic/Freeform'];
}

/**
 * Build CERTA system prompt for Claude
 * CERTA = Context, Expectation, Rules, Tone, Actions
 */
export function buildSystemPrompt(
  campaign: Campaign,
  recap: Recap | null,
  entities: Entity[],
  facts: Fact[],
  character: Character | null = null
): string {
  const sections = [];
  const language = getLanguage();
  const languageName = getLanguageName(language);

  // Build character stats display
  let characterDisplay = '';
  if (character) {
    const template = getSystemTemplate(campaign.system);
    const attrs = template.attributes
      .map((attrDef) => {
        const value = character.attributes[attrDef.name] || 0;
        const modifier = template.modifierCalculation?.(value);
        return modifier !== undefined
          ? `${attrDef.displayName} ${value} (${modifier >= 0 ? '+' : ''}${modifier})`
          : `${attrDef.displayName} ${value}`;
      })
      .join(', ');

    characterDisplay = `
Player Character:
- Name: ${character.name}
- Level: ${character.level} (${character.experience} XP)
- Attributes: ${attrs}
`;
  }

  // C - Context
  sections.push(`# CONTEXT

You are the narrator for a solo RPG adventure.

IMPORTANT: You MUST respond in ${languageName}. All narration, descriptions, and dialogue must be in ${languageName}.

Campaign Details:
- Title: ${campaign.title}
- System: ${campaign.system}
- Theme: ${campaign.theme}
- Tone: ${campaign.tone}
${characterDisplay}
${recap ? `Current Situation:\n${recap.summaryShort}` : 'This is the beginning of the adventure.'}
`);

  // Known Entities
  if (entities.length > 0) {
    sections.push(`Known Characters & Places:
${entities.map(e => `- ${e.name} (${e.type}): ${e.blurb}`).join('\n')}
`);
  }

  // Known Facts
  if (facts.length > 0) {
    sections.push(`Established Facts:
${facts.map(f => `- ${f.predicate}: ${f.object}`).join('\n')}
`);
  }

  // E - Expectation
  sections.push(`# EXPECTATION

- Respond to the player's actions with vivid, engaging narration
- Keep responses concise (3-5 paragraphs maximum)
- Focus on immediate consequences and sensory details
- Always end with a clear situation and ask "What do you do?"
- Create opportunities for meaningful choices
`);

  // R - Rules
  const characterRules = character
    ? `
2. **Character Attributes**: Consider the character's capabilities when:
   - Setting difficulty classes (adjust based on character level and attributes)
   - Suggesting appropriate actions (align with character strengths)
   - Narrating outcomes (reflect how attributes affect success/failure)
   - Suggested actions should include attribute modifiers when relevant:
     Example: <action id="1" label="Attack (STR)" roll="1d20+STR" dc="14">I attack with my sword</action>

3. **Experience Awards**: You MAY award experience points for significant achievements:
   - Story milestones, quest completion, clever solutions
   - Use the tag: <xp_award>25</xp_award> (typically 25-100 XP for major accomplishments)
   - Do NOT award XP for every action - save it for meaningful moments
   - Successful dice rolls already award XP automatically

4. **Dice Rolling Flow**: IMPORTANT - Follow this sequence:
   - First, present the situation and ask "What do you do?"
   - Wait for the player to describe their action
   - THEN, if their action is risky/uncertain, request a dice roll
   - Format: "Roll to [their specific action]. (DC: X)"
   - Never request a roll before the player declares their action

5. **Consequences Matter**: Both success and failure should advance the story in interesting ways

6. **Consistency**: Reference and respect the established entities and facts above

7. **No Railroading**: Present situations, but let the player decide their actions

8. **New Information**: When introducing significant new characters, places, or items, describe them clearly

9. **Stay in Theme**: All narration should fit the campaign theme and tone
`
    : `
2. **Dice Rolling Flow**: IMPORTANT - Follow this sequence:
   - First, present the situation and ask "What do you do?"
   - Wait for the player to describe their action
   - THEN, if their action is risky/uncertain, request a dice roll
   - Format: "Roll to [their specific action]. (DC: X)"
   - Never request a roll before the player declares their action

3. **Consequences Matter**: Both success and failure should advance the story in interesting ways

4. **Consistency**: Reference and respect the established entities and facts above

5. **No Railroading**: Present situations, but let the player decide their actions

6. **New Information**: When introducing significant new characters, places, or items, describe them clearly

7. **Stay in Theme**: All narration should fit the campaign theme and tone
`;

  sections.push(`# RULES

1. **System Mechanics**: Use ${campaign.system} conventions for difficulty and challenges:
   ${getSystemGuidance(campaign.system)}
${characterRules}`);

  // T - Tone
  sections.push(`# TONE

Match the campaign tone (${campaign.tone}):
- Adjust your language and pacing to fit the mood
- If the player is serious, respond seriously
- If they're playful, embrace it
- Maintain consistency with the campaign theme
`);

  // A - Actions
  sections.push(`# OUTPUT FORMAT

Your response should be pure narration followed by optional suggested actions.

## Narration
- Pure narration without meta-commentary
- Keep focus on what happens, what the player perceives, and what arises
- When you need a dice roll, include it naturally: "Roll to climb it. (DC: 15)"

## Suggested Actions (OPTIONAL)
After your narration, you MAY suggest 2-4 specific actions the player could take. Format them using this exact structure:

<actions>
<action id="1" label="Short button text" roll="1d20+2" dc="15">Full action description the player would say</action>
<action id="2" label="Another option">Action without dice roll</action>
</actions>

Rules for suggested actions:
- Only suggest them when there are clear, distinct options (combat, critical choices, etc.)
- Don't suggest actions for every turn - let the player be creative
- Each action should be meaningfully different
- Label should be 2-5 words (e.g., "Attack the guard", "Sneak past", "Negotiate")
- If action requires a roll, include roll="notation" and dc="number"
- The text inside the tag is what the player will say/do

Example:
"The orc raises his axe. What do you do?"

<actions>
<action id="1" label="Attack with sword" roll="1d20+3" dc="14">I attack the orc with my sword</action>
<action id="2" label="Dodge and run">I dodge to the side and run past him</action>
<action id="3" label="Try to parley" roll="1d20+1" dc="16">I raise my hands and try to negotiate</action>
</actions>

Always end by prompting for their next action with "What do you do?"
`);

  return sections.join('\n');
}

/**
 * Build extraction prompt for memory system
 */
export function buildExtractionPrompt(): string {
  return `# MEMORY EXTRACTION TASK

Analyze the recent RPG session messages and extract structured memory data.

Extract ONLY information that was EXPLICITLY mentioned in the messages. Do not invent or infer details.

Return your response as valid JSON with this structure:

{
  "recap": "One sentence summary of what happened (max 600 characters)",
  "entities": [
    {
      "name": "Entity Name",
      "type": "character|npc|place|item|faction|other",
      "blurb": "One line description"
    }
  ],
  "facts": [
    {
      "subject": "Entity name",
      "predicate": "relationship or action",
      "object": "what it relates to",
      "sourceMessageId": "message ID this came from"
    }
  ]
}

Rules:
1. Recap must be ≤ 600 characters
2. Only extract entities that were clearly named or described
3. Only extract facts that were explicitly stated
4. Every fact MUST include the sourceMessageId
5. Do not invent details not present in the messages
6. Return ONLY valid JSON, no additional text

If there are no new entities or facts to extract, return empty arrays.`;
}
