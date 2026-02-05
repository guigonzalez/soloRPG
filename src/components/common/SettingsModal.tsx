import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { saveApiKey, clearApiKey, getApiKey, getAIProvider, validateApiKeyFormat, type AIProvider } from '../../services/storage/api-key-storage';
import { getSettings, saveSettings, AVAILABLE_LANGUAGES } from '../../services/storage/settings-storage';
import { t } from '../../services/i18n/use-i18n';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const currentKey = getApiKey();
  const currentProvider = getAIProvider();
  const currentSettings = getSettings();
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AIProvider>(currentProvider);
  const [language, setLanguage] = useState(currentSettings.language);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setError(null);
    setSuccess(false);

    if (!apiKey.trim()) {
      setError(t('apiKeySetup.enterKey'));
      return;
    }

    if (!validateApiKeyFormat(apiKey, provider)) {
      if (provider === 'claude') {
        setError(t('apiKeySetup.invalidClaudeFormat'));
      } else {
        setError(t('apiKeySetup.invalidGeminiFormat'));
      }
      return;
    }

    try {
      saveApiKey(apiKey, provider);
      setSuccess(true);
      setApiKey('');

      // Reload after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleClear = () => {
    if (confirm(t('settings.removeKeyConfirm'))) {
      clearApiKey();
      window.location.reload();
    }
  };

  return (
    <div className="page-overlay">
      <div className="page-modal">
        <div className="page-hero">
          <div className="page-hero-badge">⚙️ {t('common.settings')}</div>
          <h1 className="page-hero-title">{t('settings.title')}</h1>
        </div>

        <Card title="">
          <div style={{ marginBottom: '24px' }}>
            <h3 className="page-section-title">
              {t('settings.apiKeyConfigTitle')}
            </h3>

            <div className="page-hint-box">
              <strong>{t('settings.providerLabel')}:</strong> {currentProvider === 'claude' ? 'Claude (Anthropic)' : 'Gemini (Google)'}
              <br />
              <strong>{t('settings.status')}:</strong> {currentKey ? t('settings.configured') : t('settings.notConfigured')}
              {currentKey && (
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  <button
                    onClick={() => setShowKey(!showKey)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      fontFamily: 'var(--font-family)',
                    }}
                  >
                    {showKey ? t('settings.hideKey') : t('settings.showKey')}
                  </button>
                  {showKey && (
                    <div style={{
                      marginTop: '8px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      wordBreak: 'break-all',
                    }}>
                      {currentKey}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">{t('settings.aiProvider')}</label>
              <select
                className="retro-input"
                value={provider}
                onChange={(e) => setProvider(e.target.value as AIProvider)}
              >
                <option value="claude">Claude (Anthropic)</option>
                <option value="gemini">Gemini (Google)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('settings.apiKey')}</label>
              <input
                type="password"
                className="retro-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'claude' ? 'sk-ant-api03-...' : 'AIza...'}
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                border: '2px solid var(--color-accent)',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-accent)',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                border: '2px solid var(--color-accent)',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-accent)',
                fontSize: '14px',
              }}>
                {t('settings.apiKeySaved')}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Button
                onClick={handleSave}
                disabled={!apiKey.trim() || success}
                style={{ flex: 1 }}
              >
                {t('settings.saveNewKey')}
              </Button>
              {currentKey && (
                <Button onClick={handleClear} style={{ flex: 1 }}>
                  {t('settings.removeKey')}
                </Button>
              )}
            </div>
          </div>

          <div className="page-section">
            <h3 className="page-section-title">
              {t('settings.generalSettings')}
            </h3>

            <div className="form-group">
              <label className="form-label">{t('settings.language')}</label>
              <select
                className="form-select"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  saveSettings({ language: e.target.value });
                  // Reload to apply UI language changes
                  setTimeout(() => window.location.reload(), 500);
                }}
              >
                {AVAILABLE_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                marginTop: '8px',
              }}>
                {t('settings.languageHint')}
              </div>
            </div>
          </div>

          <div className="page-section">
            <Button onClick={onClose} style={{ width: '100%' }}>
              {t('common.close')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
