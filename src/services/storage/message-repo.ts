import { getDB } from './db';
import { generateId } from '../../utils/id';
import type { Message, NewMessage } from '../../types/models';

/**
 * Message Repository - CRUD operations for messages
 */

export async function getMessagesByCampaign(
  campaignId: string,
  limit?: number
): Promise<Message[]> {
  const db = await getDB();
  const index = db.transaction('messages').store.index('campaignCreatedAt');
  const range = IDBKeyRange.bound([campaignId, 0], [campaignId, Date.now()]);

  const messages: Message[] = [];
  let cursor = await index.openCursor(range);

  while (cursor) {
    messages.push(cursor.value);
    cursor = await cursor.continue();
  }

  // If limit specified, return last N messages
  if (limit && messages.length > limit) {
    return messages.slice(-limit);
  }

  return messages;
}

export async function getMessageById(id: string): Promise<Message | undefined> {
  const db = await getDB();
  return await db.get('messages', id);
}

export async function createMessage(data: NewMessage): Promise<Message> {
  const db = await getDB();
  const message: Message = {
    id: generateId(),
    ...data,
    createdAt: Date.now(),
  };
  await db.add('messages', message);
  return message;
}

export async function getMessageCount(campaignId: string): Promise<number> {
  const db = await getDB();
  const index = db.transaction('messages').store.index('campaignId');
  return await index.count(IDBKeyRange.only(campaignId));
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('messages', id);
}

/**
 * Delete all messages in a campaign created after a specific timestamp
 */
export async function deleteMessagesAfterTimestamp(
  campaignId: string,
  afterTimestamp: number
): Promise<void> {
  const db = await getDB();
  const index = db.transaction('messages', 'readwrite').store.index('campaignCreatedAt');
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
