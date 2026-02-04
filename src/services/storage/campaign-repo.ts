import { getDB } from './db';
import { generateId } from '../../utils/id';
import type { Campaign, NewCampaign } from '../../types/models';

/**
 * Campaign Repository - CRUD operations for campaigns
 */

export async function getAllCampaigns(): Promise<Campaign[]> {
  const db = await getDB();
  const campaigns = await db.getAllFromIndex('campaigns', 'updatedAt');
  // Return in reverse chronological order (most recent first)
  return campaigns.reverse();
}

export async function getCampaignById(id: string): Promise<Campaign | undefined> {
  const db = await getDB();
  return await db.get('campaigns', id);
}

export async function createCampaign(data: NewCampaign): Promise<Campaign> {
  const db = await getDB();
  const now = Date.now();
  const campaign: Campaign = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  await db.add('campaigns', campaign);
  return campaign;
}

export async function updateCampaign(id: string, updates: Partial<NewCampaign>): Promise<Campaign> {
  const db = await getDB();
  const existing = await db.get('campaigns', id);

  if (!existing) {
    throw new Error(`Campaign ${id} not found`);
  }

  const updated: Campaign = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  await db.put('campaigns', updated);
  return updated;
}

export async function deleteCampaign(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['campaigns', 'messages', 'recaps', 'entities', 'facts', 'rolls'], 'readwrite');

  // Delete campaign
  await tx.objectStore('campaigns').delete(id);

  // Delete all associated data
  const messageStore = tx.objectStore('messages');
  const messageIndex = messageStore.index('campaignId');
  let messageCursor = await messageIndex.openCursor(IDBKeyRange.only(id));
  while (messageCursor) {
    await messageCursor.delete();
    messageCursor = await messageCursor.continue();
  }

  // Delete recap
  await tx.objectStore('recaps').delete(id);

  // Delete entities
  const entityStore = tx.objectStore('entities');
  const entityIndex = entityStore.index('campaignId');
  let entityCursor = await entityIndex.openCursor(IDBKeyRange.only(id));
  while (entityCursor) {
    await entityCursor.delete();
    entityCursor = await entityCursor.continue();
  }

  // Delete facts
  const factStore = tx.objectStore('facts');
  const factIndex = factStore.index('campaignId');
  let factCursor = await factIndex.openCursor(IDBKeyRange.only(id));
  while (factCursor) {
    await factCursor.delete();
    factCursor = await factCursor.continue();
  }

  // Delete rolls
  const rollStore = tx.objectStore('rolls');
  const rollIndex = rollStore.index('campaignId');
  let rollCursor = await rollIndex.openCursor(IDBKeyRange.only(id));
  while (rollCursor) {
    await rollCursor.delete();
    rollCursor = await rollCursor.continue();
  }

  await tx.done;
}
