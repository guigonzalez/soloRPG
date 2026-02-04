import { generateId } from '../../utils/id';
import { createCampaign } from '../storage/campaign-repo';
import { createMessage } from '../storage/message-repo';
import { createCharacter } from '../storage/character-repo';
import type { CampaignExport } from './campaign-exporter';
import type { Campaign, Message, Character } from '../../types/models';

/**
 * Import validation result
 */
export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate campaign export data structure
 */
export function validateCampaignExport(data: any): ImportValidationResult {
  const errors: string[] = [];

  // Check version
  if (!data.version) {
    errors.push('Missing export version');
  }

  // Check campaign
  if (!data.campaign) {
    errors.push('Missing campaign data');
  } else {
    if (!data.campaign.system) errors.push('Missing campaign system');
    if (!data.campaign.theme) errors.push('Missing campaign theme');
    if (!data.campaign.tone) errors.push('Missing campaign tone');
  }

  // Check arrays
  if (!Array.isArray(data.messages)) {
    errors.push('Invalid messages data');
  }

  // Rolls are optional (they represent past events and don't need to be imported)

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Import a campaign from JSON data
 */
export async function importCampaign(jsonData: string): Promise<Campaign> {
  try {
    // Parse JSON
    const data: CampaignExport = JSON.parse(jsonData);

    // Validate structure
    const validation = validateCampaignExport(data);
    if (!validation.valid) {
      throw new Error(`Invalid campaign data: ${validation.errors.join(', ')}`);
    }

    // Generate new IDs for all entities to avoid conflicts
    const newCampaignId = generateId();

    // Create campaign with new ID
    const newCampaign: Campaign = {
      ...data.campaign,
      id: newCampaignId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await createCampaign(newCampaign);

    // Import character if exists
    if (data.character) {
      const newCharacter: Character = {
        ...data.character,
        id: generateId(),
        campaignId: newCampaignId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await createCharacter(newCharacter);
    }

    // Import messages
    for (const message of data.messages) {
      const newMessage: Message = {
        ...message,
        id: generateId(),
        campaignId: newCampaignId,
        createdAt: message.createdAt, // Preserve original timestamp for chronological order
      };
      await createMessage(newMessage);
    }

    // Skip importing rolls - they represent past events that already happened
    // and don't need to be replayed in the imported campaign

    return newCampaign;
  } catch (error) {
    console.error('Error importing campaign:', error);
    throw error;
  }
}

/**
 * Import campaign from a file
 */
export async function importCampaignFromFile(file: File): Promise<Campaign> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const jsonData = event.target?.result as string;
        const campaign = await importCampaign(jsonData);
        resolve(campaign);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
