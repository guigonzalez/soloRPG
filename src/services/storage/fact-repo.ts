import { getDB } from './db';
import { generateId } from '../../utils/id';
import type { Fact, NewFact } from '../../types/models';

/**
 * Fact Repository - Operations for campaign facts
 * Max 20 facts per campaign
 */

const MAX_FACTS_PER_CAMPAIGN = 20;

export async function getFactsByCampaign(campaignId: string): Promise<Fact[]> {
  const db = await getDB();
  const index = db.transaction('facts').store.index('campaignCreatedAt');
  const range = IDBKeyRange.bound([campaignId, 0], [campaignId, Date.now()]);

  const facts: Fact[] = [];
  let cursor = await index.openCursor(range);

  while (cursor) {
    facts.push(cursor.value);
    cursor = await cursor.continue();
  }

  return facts;
}

export async function getFactsByEntity(entityId: string): Promise<Fact[]> {
  const db = await getDB();
  const index = db.transaction('facts').store.index('subjectEntityId');
  return await index.getAll(IDBKeyRange.only(entityId));
}

export async function getFactById(id: string): Promise<Fact | undefined> {
  const db = await getDB();
  return await db.get('facts', id);
}

export async function createFact(data: NewFact): Promise<Fact> {
  const db = await getDB();

  // Validate that sourceMessageId is provided
  if (!data.sourceMessageId) {
    throw new Error('Fact must have a sourceMessageId to prevent hallucination');
  }

  const fact: Fact = {
    id: generateId(),
    ...data,
    createdAt: Date.now(),
  };

  // Check if we need to remove old facts
  const existingFacts = await getFactsByCampaign(data.campaignId);

  if (existingFacts.length >= MAX_FACTS_PER_CAMPAIGN) {
    // Remove the oldest fact
    const oldestFact = existingFacts[0];
    await db.delete('facts', oldestFact.id);
  }

  await db.add('facts', fact);
  return fact;
}

export async function deleteFact(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('facts', id);
}

/**
 * Validate that a fact references a valid source message
 */
export async function validateFactSource(fact: NewFact): Promise<boolean> {
  if (!fact.sourceMessageId) {
    return false;
  }

  const db = await getDB();
  const message = await db.get('messages', fact.sourceMessageId);
  return message !== undefined;
}
