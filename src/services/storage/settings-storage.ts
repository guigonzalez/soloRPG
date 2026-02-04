/**
 * Settings storage service
 */

const SETTINGS_KEY = 'solorpg-settings';

export interface AppSettings {
  language: string; // ISO language code (e.g., 'en', 'pt', 'es')
  autoSaveInterval: number; // Minutes between auto-saves (0 = disabled)
  theme: '8bit-green' | '8bit-amber' | 'classic';
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en', // Default to English
  autoSaveInterval: 5,
  theme: '8bit-green',
};

/**
 * Get current settings
 */
export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings
 */
export function saveSettings(settings: Partial<AppSettings>): void {
  try {
    const current = getSettings();
    const updated = {
      ...current,
      ...settings,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

/**
 * Get language setting
 */
export function getLanguage(): string {
  return getSettings().language;
}

/**
 * Get language name for display
 */
export function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'pt': 'Português',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'ja': '日本語',
    'ko': '한국어',
    'zh': '中文',
    'ru': 'Русский',
  };

  return languages[code] || code;
}

/**
 * Available languages with UI translations
 */
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'es', name: 'Español' },
];
