import { getCampaignById } from '../storage/campaign-repo';
import { getMessagesByCampaign } from '../storage/message-repo';
import { getRollsByCampaign } from '../storage/roll-repo';
import { getCharacterByCampaign } from '../storage/character-repo';
import type { Campaign, Message, Roll, Character } from '../../types/models';

/**
 * Campaign export data structure
 */
export interface CampaignExport {
  version: string; // Export format version for future compatibility
  exportedAt: number;
  campaign: Campaign;
  character: Character | null;
  messages: Message[];
  rolls: Roll[];
}

/**
 * Export a complete campaign to JSON
 */
export async function exportCampaign(campaignId: string): Promise<string> {
  try {
    // Gather all campaign data
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const character = await getCharacterByCampaign(campaignId);
    const messages = await getMessagesByCampaign(campaignId);
    const rolls = await getRollsByCampaign(campaignId);

    // Create export object
    const exportData: CampaignExport = {
      version: '1.0',
      exportedAt: Date.now(),
      campaign,
      character: character || null,
      messages,
      rolls,
    };

    // Convert to JSON string with pretty formatting
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting campaign:', error);
    throw error;
  }
}

/**
 * Download campaign export as a JSON file
 */
export function downloadCampaignExport(campaignName: string, jsonData: string): void {
  // Create a blob from the JSON data
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(campaignName)}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename to remove invalid characters
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9_\-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

/**
 * Export campaign and trigger download
 */
export async function exportAndDownloadCampaign(campaignId: string, campaignName: string): Promise<void> {
  const jsonData = await exportCampaign(campaignId);
  downloadCampaignExport(campaignName, jsonData);
}
