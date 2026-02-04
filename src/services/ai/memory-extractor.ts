import { getClaudeClient } from './claude-client';
import { getGeminiClient } from './gemini-client';
import { getAIProvider } from '../storage/api-key-storage';
import { getLanguage, getLanguageName } from '../storage/settings-storage';
import type { Message } from '../../types/models';

/**
 * Memory extraction result
 */
export interface ExtractedMemory {
  recap: string;
  entities: Array<{
    name: string;
    type: 'character' | 'npc' | 'place' | 'item' | 'faction' | 'other';
    blurb: string;
  }>;
  facts: Array<{
    subjectEntityId: string; // Name of the entity for now
    predicate: string;
    object: string;
    sourceMessageId: string;
  }>;
}

/**
 * Extract memory from recent messages
 */
export async function extractMemory(
  messages: Message[]
): Promise<ExtractedMemory> {
  const provider = getAIProvider();

  // Get appropriate client and increase maxTokens for memory extraction
  let client;
  if (provider === 'gemini') {
    const geminiClient = getGeminiClient();
    // Override maxTokens for this request
    (geminiClient as any).maxTokens = 4000;
    client = geminiClient;
  } else {
    const claudeClient = getClaudeClient();
    (claudeClient as any).maxTokens = 4000;
    client = claudeClient;
  }

  const language = getLanguage();
  const languageName = getLanguageName(language);

  const systemPrompt = `You are a memory extraction assistant for a solo RPG game.

IMPORTANT: Extract and write all content (recap, entity descriptions, facts) in ${languageName}.

Your task is to analyze recent game messages and extract:
1. A brief recap (max 600 characters) in ${languageName}
2. Important entities (characters, NPCs, places, items, factions)
3. Key facts that should be remembered

RULES:
- Only extract information explicitly stated in the messages
- Do not invent or hallucinate details
- Facts must reference the source message ID
- Recap should summarize the current situation
- Entities should be unique (no duplicates)
- Maximum 10 entities, maximum 20 facts
- ALL extracted content must be in ${languageName}

OUTPUT FORMAT - Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "recap": "Brief summary in ${languageName} (max 600 chars)",
  "entities": [
    {"name": "Entity Name", "type": "character|npc|place|item|faction|other", "blurb": "Short description in ${languageName}"}
  ],
  "facts": [
    {"subjectEntityId": "Entity Name", "predicate": "action or state in ${languageName}", "object": "details in ${languageName}", "sourceMessageId": "message-id"}
  ]
}

IMPORTANT: Return ONLY the JSON object, nothing else. Do not wrap it in code blocks or markdown.`;

  // Prepare messages for extraction (last 10 messages)
  const recentMessages = messages.slice(-10).map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: `[${msg.id}] ${msg.content}`,
  }));

  try {
    console.log('Sending memory extraction request with', recentMessages.length, 'messages');

    const response = await client.sendMessageSync(
      systemPrompt,
      recentMessages as any
    );

    console.log('AI response for memory extraction (length:', response.length, '):', response.substring(0, 200) + '...');

    // Parse JSON response - handle markdown code blocks
    let jsonText = response;

    // Remove markdown code block markers if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Extract JSON object - try to find complete JSON
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', response);
      throw new Error('Failed to extract JSON from AI response');
    }

    let jsonString = jsonMatch[0];
    console.log('Extracted JSON (length:', jsonString.length, ')');

    // Try to parse - if it fails due to truncation, try to fix common issues
    let extracted: ExtractedMemory;
    try {
      extracted = JSON.parse(jsonString);
    } catch (parseError) {
      console.warn('Initial JSON parse failed, attempting to fix truncated JSON');

      // Try to fix truncated JSON by completing common patterns
      // If recap is incomplete, close it
      if (jsonString.includes('"recap":') && !jsonString.includes('"entities":')) {
        jsonString = jsonString.replace(/"recap":\s*"([^"]*?)$/, '"recap": "$1", "entities": [], "facts": []');
        if (!jsonString.endsWith('}')) jsonString += '}';
      }

      // If entities array is incomplete
      if (jsonString.includes('"entities":') && !jsonString.includes('"facts":')) {
        jsonString = jsonString.replace(/"entities":\s*\[.*?$/, '"entities": [], "facts": []');
        if (!jsonString.endsWith('}')) jsonString += '}';
      }

      console.log('Attempting to parse fixed JSON:', jsonString.substring(0, 200));
      try {
        extracted = JSON.parse(jsonString);
      } catch (retryError) {
        console.error('JSON parsing failed even after fix attempt');
        throw new Error('Failed to parse JSON from AI response');
      }
    }

    console.log('Parsed memory successfully:', {
      recap: extracted.recap?.substring(0, 100) + '...',
      entitiesCount: extracted.entities?.length || 0,
      factsCount: extracted.facts?.length || 0
    });

    console.log('Parsed memory:', extracted);

    // Ensure all fields exist
    if (!extracted.recap) extracted.recap = '';
    if (!extracted.entities) extracted.entities = [];
    if (!extracted.facts) extracted.facts = [];

    // Validate recap length
    if (extracted.recap && extracted.recap.length > 600) {
      extracted.recap = extracted.recap.substring(0, 597) + '...';
    }

    // Limit entities to 10
    if (extracted.entities && extracted.entities.length > 10) {
      extracted.entities = extracted.entities.slice(0, 10);
    }

    // Limit facts to 20
    if (extracted.facts && extracted.facts.length > 20) {
      extracted.facts = extracted.facts.slice(0, 20);
    }

    return extracted;
  } catch (error) {
    console.error('Memory extraction failed:', error);
    // Return empty memory on failure
    return {
      recap: '',
      entities: [],
      facts: [],
    };
  }
}
