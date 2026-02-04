import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Campaign, Message, Recap, Entity, Fact, Roll } from '../../types/models';

/**
 * IndexedDB Schema for SoloRPG
 */
interface SoloRPGDB extends DBSchema {
  campaigns: {
    key: string;
    value: Campaign;
    indexes: {
      'createdAt': number;
      'updatedAt': number;
    };
  };
  messages: {
    key: string;
    value: Message;
    indexes: {
      'campaignId': string;
      'campaignCreatedAt': [string, number];
    };
  };
  recaps: {
    key: string; // campaignId
    value: Recap;
    indexes: {
      'updatedAt': number;
    };
  };
  entities: {
    key: string;
    value: Entity;
    indexes: {
      'campaignId': string;
      'campaignLastSeen': [string, number];
    };
  };
  facts: {
    key: string;
    value: Fact;
    indexes: {
      'campaignId': string;
      'subjectEntityId': string;
      'sourceMessageId': string;
      'campaignCreatedAt': [string, number];
    };
  };
  rolls: {
    key: string;
    value: Roll;
    indexes: {
      'campaignId': string;
      'campaignCreatedAt': [string, number];
    };
  };
}

const DB_NAME = import.meta.env.VITE_DB_NAME || 'solo-rpg-db';
const DB_VERSION = parseInt(import.meta.env.VITE_DB_VERSION || '1', 10);

let dbInstance: IDBPDatabase<SoloRPGDB> | null = null;

/**
 * Initialize and get the IndexedDB database instance
 */
export async function getDB(): Promise<IDBPDatabase<SoloRPGDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<SoloRPGDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

      // Version 1: Initial schema
      if (oldVersion < 1) {
        // Campaigns store
        const campaignStore = db.createObjectStore('campaigns', { keyPath: 'id' });
        campaignStore.createIndex('createdAt', 'createdAt');
        campaignStore.createIndex('updatedAt', 'updatedAt');

        // Messages store
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('campaignId', 'campaignId');
        messageStore.createIndex('campaignCreatedAt', ['campaignId', 'createdAt']);

        // Recaps store (one per campaign)
        const recapStore = db.createObjectStore('recaps', { keyPath: 'campaignId' });
        recapStore.createIndex('updatedAt', 'updatedAt');

        // Entities store
        const entityStore = db.createObjectStore('entities', { keyPath: 'id' });
        entityStore.createIndex('campaignId', 'campaignId');
        entityStore.createIndex('campaignLastSeen', ['campaignId', 'lastSeenAt']);

        // Facts store
        const factStore = db.createObjectStore('facts', { keyPath: 'id' });
        factStore.createIndex('campaignId', 'campaignId');
        factStore.createIndex('subjectEntityId', 'subjectEntityId');
        factStore.createIndex('sourceMessageId', 'sourceMessageId');
        factStore.createIndex('campaignCreatedAt', ['campaignId', 'createdAt']);

        // Rolls store
        const rollStore = db.createObjectStore('rolls', { keyPath: 'id' });
        rollStore.createIndex('campaignId', 'campaignId');
        rollStore.createIndex('campaignCreatedAt', ['campaignId', 'createdAt']);
      }

      // Future migrations go here
      // if (oldVersion < 2) { ... }
    },
    blocked() {
      console.warn('Database upgrade blocked. Close other tabs with this app.');
    },
    blocking() {
      console.warn('Database is blocking an upgrade. Closing connection.');
      dbInstance?.close();
      dbInstance = null;
    },
  });

  return dbInstance;
}

/**
 * Close the database connection
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Delete the entire database (use with caution)
 */
export async function deleteDB(): Promise<void> {
  closeDB();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      console.warn('Database deletion blocked. Close all tabs with this app.');
    };
  });
}
