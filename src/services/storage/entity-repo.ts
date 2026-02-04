import { getDB } from './db';
import { generateId } from '../../utils/id';
import type { Entity, NewEntity } from '../../types/models';

/**
 * Entity Repository - Operations for campaign entities
 * Max 10 active entities per campaign
 */

const MAX_ENTITIES_PER_CAMPAIGN = 10;

export async function getEntitiesByCampaign(campaignId: string): Promise<Entity[]> {
  const db = await getDB();
  const index = db.transaction('entities').store.index('campaignLastSeen');
  const range = IDBKeyRange.bound([campaignId, 0], [campaignId, Date.now()]);

  const entities: Entity[] = [];
  let cursor = await index.openCursor(range, 'prev'); // Most recent first

  while (cursor) {
    entities.push(cursor.value);
    cursor = await cursor.continue();
  }

  return entities;
}

export async function getEntityById(id: string): Promise<Entity | undefined> {
  const db = await getDB();
  return await db.get('entities', id);
}

export async function createEntity(data: NewEntity): Promise<Entity> {
  const db = await getDB();
  const entity: Entity = {
    id: generateId(),
    ...data,
    lastSeenAt: Date.now(),
  };

  // Check if we need to remove old entities
  const existingEntities = await getEntitiesByCampaign(data.campaignId);

  if (existingEntities.length >= MAX_ENTITIES_PER_CAMPAIGN) {
    // Remove the oldest entity
    const oldestEntity = existingEntities[existingEntities.length - 1];
    await db.delete('entities', oldestEntity.id);
  }

  await db.add('entities', entity);
  return entity;
}

export async function updateEntity(id: string, updates: Partial<Omit<Entity, 'id' | 'campaignId'>>): Promise<Entity> {
  const db = await getDB();
  const existing = await db.get('entities', id);

  if (!existing) {
    throw new Error(`Entity ${id} not found`);
  }

  const updated: Entity = {
    ...existing,
    ...updates,
    lastSeenAt: Date.now(),
  };

  await db.put('entities', updated);
  return updated;
}

export async function deleteEntity(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('entities', id);
}

/**
 * Check if an entity with similar name already exists
 * Used for deduplication
 */
export async function findSimilarEntity(campaignId: string, name: string): Promise<Entity | undefined> {
  const entities = await getEntitiesByCampaign(campaignId);
  const normalizedName = name.toLowerCase().trim();

  return entities.find(e => e.name.toLowerCase().trim() === normalizedName);
}
