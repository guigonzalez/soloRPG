/**
 * Validation utilities
 */

export function validateCampaignTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length > 100) {
    return 'Title must be 100 characters or less';
  }
  return null;
}

export function validateCampaignSystem(system: string): string | null {
  if (!system || system.trim().length === 0) {
    return 'RPG system is required';
  }
  return null;
}

export function validateCampaignTheme(theme: string): string | null {
  if (!theme || theme.trim().length === 0) {
    return 'Theme is required';
  }
  if (theme.length > 200) {
    return 'Theme must be 200 characters or less';
  }
  return null;
}

export function validateCampaignTone(tone: string): string | null {
  if (!tone || tone.trim().length === 0) {
    return 'Tone is required';
  }
  if (tone.length > 100) {
    return 'Tone must be 100 characters or less';
  }
  return null;
}

export function validateMessage(content: string): string | null {
  if (!content || content.trim().length === 0) {
    return 'Message cannot be empty';
  }
  if (content.length > 5000) {
    return 'Message must be 5000 characters or less';
  }
  return null;
}

export function validateRecap(recap: string): string | null {
  if (recap.length > 600) {
    return 'Recap must be 600 characters or less';
  }
  return null;
}
