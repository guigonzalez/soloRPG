/**
 * API Key Storage Service
 * Manages API keys for multiple AI providers (Claude, Gemini)
 */

const API_KEY_STORAGE_KEY = 'solorpg_api_key';
const AI_PROVIDER_STORAGE_KEY = 'solorpg_ai_provider';

export type AIProvider = 'claude' | 'gemini';

/**
 * Save API key and provider to localStorage
 */
export function saveApiKey(apiKey: string, provider: AIProvider): void {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API key cannot be empty');
  }

  // Basic validation
  if (!validateApiKeyFormat(apiKey, provider)) {
    if (provider === 'claude') {
      throw new Error('Invalid Claude API key format. Should start with "sk-ant-"');
    } else {
      throw new Error('Invalid Gemini API key format');
    }
  }

  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
  localStorage.setItem(AI_PROVIDER_STORAGE_KEY, provider);
}

/**
 * Get API key from localStorage or environment
 * Priority: localStorage > environment variable
 */
export function getApiKey(): string | null {
  // First, try localStorage (user-provided key)
  const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (storedKey) {
    return storedKey;
  }

  // Fallback to environment variable (Claude only for backward compatibility)
  const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (envKey) {
    return envKey;
  }

  return null;
}

/**
 * Get selected AI provider
 */
export function getAIProvider(): AIProvider {
  const stored = localStorage.getItem(AI_PROVIDER_STORAGE_KEY);

  // Default to claude if not set or invalid
  if (stored === 'gemini') {
    return 'gemini';
  }

  return 'claude';
}

/**
 * Check if API key is configured
 */
export function hasApiKey(): boolean {
  return getApiKey() !== null;
}

/**
 * Remove API key and provider from localStorage
 */
export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  localStorage.removeItem(AI_PROVIDER_STORAGE_KEY);
}

/**
 * Validate API key format based on provider
 */
export function validateApiKeyFormat(apiKey: string, provider: AIProvider): boolean {
  if (provider === 'claude') {
    return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
  } else if (provider === 'gemini') {
    // Gemini keys typically start with "AIza" and are ~39 characters
    return apiKey.length > 20;
  }

  return false;
}
