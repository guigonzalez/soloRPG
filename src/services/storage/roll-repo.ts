import { getDB } from './db';
import { generateId } from '../../utils/id';
import type { Roll, NewRoll } from '../../types/models';

/**
 * Roll Repository - Operations for dice rolls
 */

export async function getRollsByCampaign(
  campaignId: string,
  limit?: number
): Promise<Roll[]> {
  const db = await getDB();
  const index = db.transaction('rolls').store.index('campaignCreatedAt');
  const range = IDBKeyRange.bound([campaignId, 0], [campaignId, Date.now()]);

  const rolls: Roll[] = [];
  let cursor = await index.openCursor(range);

  while (cursor) {
    rolls.push(cursor.value);
    cursor = await cursor.continue();
  }

  // If limit specified, return last N rolls
  if (limit && rolls.length > limit) {
    return rolls.slice(-limit);
  }

  return rolls;
}

export async function getRollById(id: string): Promise<Roll | undefined> {
  const db = await getDB();
  return await db.get('rolls', id);
}

export async function createRoll(data: NewRoll): Promise<Roll> {
  const db = await getDB();
  const roll: Roll = {
    id: generateId(),
    ...data,
    createdAt: Date.now(),
  };
  await db.add('rolls', roll);
  return roll;
}

export async function deleteRoll(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('rolls', id);
}

/**
 * Delete all rolls in a campaign created after a specific timestamp
 */
export async function deleteRollsAfterTimestamp(
  campaignId: string,
  afterTimestamp: number
): Promise<void> {
  const db = await getDB();
  const index = db.transaction('rolls', 'readwrite').store.index('campaignCreatedAt');
  const range = IDBKeyRange.bound(
    [campaignId, afterTimestamp],
    [campaignId, Date.now()]
  );

  let cursor = await index.openCursor(range);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
}
