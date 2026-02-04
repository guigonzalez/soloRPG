import { getDB } from './db';
import type { Recap } from '../../types/models';

/**
 * Recap Repository - Operations for campaign recaps (one per campaign)
 */

export async function getRecapByCampaign(campaignId: string): Promise<Recap | undefined> {
  const db = await getDB();
  return await db.get('recaps', campaignId);
}

export async function upsertRecap(recap: Recap): Promise<void> {
  const db = await getDB();
  const updated: Recap = {
    ...recap,
    updatedAt: Date.now(),
  };
  await db.put('recaps', updated);
}

export async function deleteRecap(campaignId: string): Promise<void> {
  const db = await getDB();
  await db.delete('recaps', campaignId);
}
