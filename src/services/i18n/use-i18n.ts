import { getLanguage } from '../storage/settings-storage';
import { translations, type Language, type Translations } from './translations';

/**
 * Get nested property from object using dot notation
 * Example: get(obj, 'common.back') => obj.common.back
 */
function get(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

/**
 * Replace placeholders in translation strings
 * Example: "You are now Level {level}" with {level: 5} => "You are now Level 5"
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, text);
}

/**
 * Get translation for a key
 * @param key - Translation key in dot notation (e.g., 'common.back')
 * @param params - Optional parameters for interpolation
 * @returns Translated string
 */
export function useTranslation(key: string, params?: Record<string, string | number>): string {
  const language = getLanguage() as Language;
  const t = translations[language] || translations.en;
  const text = get(t, key);
  return interpolate(text, params);
}

/**
 * Get the entire translation object for the current language
 */
export function useTranslations(): Translations {
  const language = getLanguage() as Language;
  return translations[language] || translations.en;
}

/**
 * Shorthand alias for useTranslation
 */
export const t = useTranslation;

/**
 * Get current language code
 */
export function getCurrentLanguage(): Language {
  return getLanguage() as Language;
}
