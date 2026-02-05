import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { saveApiKey, validateApiKeyFormat, type AIProvider } from '../../services/storage/api-key-storage';
import { t } from '../../services/i18n/use-i18n';

interface ApiKeySetupProps {
  onComplete: () => void;
}

export function ApiKeySetup({ onComplete }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AIProvider>('claude');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

    setIsValidating(true);

    try {
      // Save to localStorage
      saveApiKey(apiKey, provider);

      // Reload to pick up the new key
      onComplete();
    } catch (err) {
      setError((err as Error).message);
      setIsValidating(false);
    }
  };

  return (
    <div className="page-overlay">
      <div className="page-modal">
        <div className="page-hero">
          <div className="page-hero-badge">🔑 {t('landing.badge')}</div>
          <h1 className="page-hero-title">{t('apiKeySetup.welcome')}</h1>
          <p className="page-hero-tagline">{t('apiKeySetup.intro')}</p>
          <p className="page-hero-tagline" style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
            {t('apiKeySetup.introPrivacy')}
          </p>
        </div>

        <Card title="">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('apiKeySetup.aiProvider')}</label>
              <select
                className="retro-input"
                value={provider}
                onChange={(e) => setProvider(e.target.value as AIProvider)}
                disabled={isValidating}
              >
                <option value="claude">Claude (Anthropic)</option>
                <option value="gemini">Gemini (Google)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {provider === 'claude' ? t('apiKeySetup.anthropicKey') : t('apiKeySetup.googleKey')}
              </label>
              <input
                type="password"
                className="retro-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'claude' ? 'sk-ant-api03-...' : 'AIza...'}
                disabled={isValidating}
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            {error && (
              <div className="error-container" style={{ marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div className="page-hint-box">
              <strong>{t('apiKeySetup.noKeyTitle')}</strong>

              {provider === 'claude' ? (
                <>
                  <ol style={{ marginLeft: '20px', marginBottom: '8px' }}>
                    <li>{t('apiKeySetup.claudeStep1')} <a
                      className="page-link"
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      console.anthropic.com
                    </a></li>
                    <li>{t('apiKeySetup.claudeStep2')}</li>
                    <li>{t('apiKeySetup.claudeStep3')}</li>
                    <li>{t('apiKeySetup.claudeStep4')}</li>
                  </ol>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {t('apiKeySetup.claudeNote')}
                  </div>
                </>
              ) : (
                <>
                  <ol style={{ marginLeft: '20px', marginBottom: '8px' }}>
                    <li>{t('apiKeySetup.geminiStep1')} <a
                      className="page-link"
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      aistudio.google.com
                    </a></li>
                    <li>{t('apiKeySetup.geminiStep2')}</li>
                    <li>{t('apiKeySetup.geminiStep3')}</li>
                    <li>{t('apiKeySetup.geminiStep4')}</li>
                  </ol>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {t('apiKeySetup.geminiNote')}
                  </div>
                </>
              )}
            </div>

            <Button
              type="submit"
              disabled={isValidating || !apiKey.trim()}
              className="landing-cta-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {isValidating ? t('apiKeySetup.saving') : t('apiKeySetup.saveAndStart')}
            </Button>

            <div className="page-hero-tagline" style={{ marginTop: '12px', fontSize: '11px', textAlign: 'center' }}>
              {t('apiKeySetup.changeLater')}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
