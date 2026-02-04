import { getDB } from './db';
import { generateId } from '../../utils/id';
import type { Character, NewCharacter } from '../../types/models';

/**
 * Character Repository - CRUD operations for characters
 * Note: One character per campaign (enforced by getCharacterByCampaign)
 */

/**
 * Get all characters
 */
export async function getAllCharacters(): Promise<Character[]> {
  const db = await getDB();
  return await db.getAll('characters');
}

/**
 * Get character by ID
 */
export async function getCharacterById(id: string): Promise<Character | undefined> {
  const db = await getDB();
  return await db.get('characters', id);
}

/**
 * Get character by campaign ID (one character per campaign)
 */
export async function getCharacterByCampaign(campaignId: string): Promise<Character | undefined> {
  const db = await getDB();
  const characters = await db.getAllFromIndex('characters', 'campaignId', campaignId);
  return characters[0]; // Only one character per campaign
}

/**
 * Create a new character
 * Throws error if character already exists for campaign
 */
export async function createCharacter(data: NewCharacter): Promise<Character> {
  const db = await getDB();

  // Check if character already exists for this campaign
  const existing = await getCharacterByCampaign(data.campaignId);
  if (existing) {
    throw new Error(`Character already exists for campaign ${data.campaignId}`);
  }

  const now = Date.now();
  const character: Character = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await db.add('characters', character);
  return character;
}

/**
 * Update an existing character
 */
export async function updateCharacter(
  id: string,
  updates: Partial<Omit<Character, 'id' | 'campaignId' | 'createdAt'>>
): Promise<Character> {
  const db = await getDB();
  const existing = await db.get('characters', id);

  if (!existing) {
    throw new Error(`Character ${id} not found`);
  }

  const updated: Character = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  await db.put('characters', updated);
  return updated;
}

/**
 * Update character experience and level
 */
export async function updateCharacterProgress(
  id: string,
  experience: number,
  level: number
): Promise<Character> {
  return await updateCharacter(id, { experience, level });
}

/**
 * Update character attributes
 */
export async function updateCharacterAttributes(
  id: string,
  attributes: Record<string, number>
): Promise<Character> {
  return await updateCharacter(id, { attributes });
}

/**
 * Increment a specific attribute value
 */
export async function incrementCharacterAttribute(
  id: string,
  attributeName: string,
  incrementBy: number = 1
): Promise<Character> {
  const character = await getCharacterById(id);

  if (!character) {
    throw new Error(`Character ${id} not found`);
  }

  const updatedAttributes = {
    ...character.attributes,
    [attributeName]: (character.attributes[attributeName] || 0) + incrementBy,
  };

  return await updateCharacterAttributes(id, updatedAttributes);
}

/**
 * Delete a character
 */
export async function deleteCharacter(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('characters', id);
}

/**
 * Delete all characters for a campaign
 */
export async function deleteCharactersByCampaign(campaignId: string): Promise<void> {
  const db = await getDB();
  const characters = await db.getAllFromIndex('characters', 'campaignId', campaignId);

  for (const character of characters) {
    await db.delete('characters', character.id);
  }
}
