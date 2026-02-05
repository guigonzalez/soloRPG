/**
 * 50 pre-made campaign templates for quick start
 * Title, theme, tone come from i18n translations
 */

import type { NewCampaign } from '../../types/models';

export interface PresetCampaignMeta {
  id: string;
  system: string;
  tag?: string;
}

export interface PresetCampaignResolved extends PresetCampaignMeta {
  title: string;
  theme: string;
  tone: string;
}

/** Convert resolved preset to NewCampaign for creation */
export function presetToNewCampaign(preset: PresetCampaignResolved): NewCampaign {
  return {
    title: preset.title,
    system: preset.system,
    theme: preset.theme,
    tone: preset.tone,
  };
}

export const PRESET_CAMPAIGNS: PresetCampaignMeta[] = [
  { id: '1', system: 'D&D 5e', tag: 'fantasy' },
  { id: '2', system: 'D&D 5e', tag: 'fantasy' },
  { id: '3', system: 'D&D 5e', tag: 'fantasy' },
  { id: '4', system: 'D&D 5e', tag: 'fantasy' },
  { id: '5', system: 'D&D 5e', tag: 'fantasy' },
  { id: '6', system: 'D&D 5e', tag: 'fantasy' },
  { id: '7', system: 'D&D 5e', tag: 'fantasy' },
  { id: '8', system: 'D&D 5e', tag: 'fantasy' },
  { id: '9', system: 'D&D 5e', tag: 'fantasy' },
  { id: '10', system: 'D&D 5e', tag: 'fantasy' },
  { id: '11', system: 'D&D 5e', tag: 'fantasy' },
  { id: '12', system: 'D&D 5e', tag: 'fantasy' },
  { id: '13', system: 'D&D 5e', tag: 'fantasy' },
  { id: '14', system: 'D&D 5e', tag: 'fantasy' },
  { id: '15', system: 'D&D 5e', tag: 'fantasy' },
  { id: '16', system: 'Call of Cthulhu', tag: 'horror' },
  { id: '17', system: 'Call of Cthulhu', tag: 'horror' },
  { id: '18', system: 'Call of Cthulhu', tag: 'horror' },
  { id: '19', system: 'Call of Cthulhu', tag: 'horror' },
  { id: '20', system: 'Call of Cthulhu', tag: 'horror' },
  { id: '21', system: 'Call of Cthulhu', tag: 'horror' },
  { id: '22', system: 'Call of Cthulhu', tag: 'horror' },
  { id: '23', system: 'Call of Cthulhu', tag: 'horror' },
  { id: '24', system: 'Call of Cthulhu', tag: 'horror' },
  { id: '25', system: 'Call of Cthulhu', tag: 'horror' },
  { id: '26', system: 'Cyberpunk RED', tag: 'cyberpunk' },
  { id: '27', system: 'Cyberpunk RED', tag: 'cyberpunk' },
  { id: '28', system: 'Cyberpunk RED', tag: 'cyberpunk' },
  { id: '29', system: 'Cyberpunk RED', tag: 'cyberpunk' },
  { id: '30', system: 'Cyberpunk RED', tag: 'cyberpunk' },
  { id: '31', system: 'Cyberpunk RED', tag: 'cyberpunk' },
  { id: '32', system: 'Cyberpunk RED', tag: 'cyberpunk' },
  { id: '33', system: 'Cyberpunk RED', tag: 'cyberpunk' },
  { id: '34', system: 'Cyberpunk RED', tag: 'cyberpunk' },
  { id: '35', system: 'Cyberpunk RED', tag: 'cyberpunk' },
  { id: '36', system: 'Vampire: The Masquerade', tag: 'vampire' },
  { id: '37', system: 'Vampire: The Masquerade', tag: 'vampire' },
  { id: '38', system: 'Vampire: The Masquerade', tag: 'vampire' },
  { id: '39', system: 'Vampire: The Masquerade', tag: 'vampire' },
  { id: '40', system: 'Vampire: The Masquerade', tag: 'vampire' },
  { id: '41', system: 'Vampire: The Masquerade', tag: 'vampire' },
  { id: '42', system: 'Vampire: The Masquerade', tag: 'vampire' },
  { id: '43', system: 'Generic/Freeform', tag: 'survival' },
  { id: '44', system: 'Generic/Freeform', tag: 'scifi' },
  { id: '45', system: 'Generic/Freeform', tag: 'urban' },
  { id: '46', system: 'Generic/Freeform', tag: 'scifi' },
  { id: '47', system: 'Generic/Freeform', tag: 'survival' },
  { id: '48', system: 'Generic/Freeform', tag: 'scifi' },
  { id: '49', system: 'Generic/Freeform', tag: 'fantasy' },
  { id: '50', system: 'Generic/Freeform', tag: 'western' },
];
