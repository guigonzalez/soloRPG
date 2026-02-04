import { ulid } from 'ulid';

/**
 * Generate a unique, time-sortable ID
 * Uses ULID format: chronologically sortable and URL-safe
 */
export function generateId(): string {
  return ulid();
}
