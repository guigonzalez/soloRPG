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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--color-bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <Card title={t('apiKeySetup.welcome')}>
          <div style={{ marginBottom: '24px', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '12px' }}>
              {t('apiKeySetup.intro')}
            </p>
            <p style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {t('apiKeySetup.introPrivacy')}
            </p>
          </div>

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

            <div style={{
              padding: '12px',
              marginBottom: '16px',
              border: '2px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-primary)',
              fontSize: '12px',
              lineHeight: '1.6',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {t('apiKeySetup.noKeyTitle')}
              </div>

              {provider === 'claude' ? (
                <>
                  <ol style={{ marginLeft: '20px', marginBottom: '8px' }}>
                    <li>{t('apiKeySetup.claudeStep1')} <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
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
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
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
              style={{ width: '100%' }}
            >
              {isValidating ? t('apiKeySetup.saving') : t('apiKeySetup.saveAndStart')}
            </Button>

            <div style={{
              marginTop: '12px',
              fontSize: '11px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}>
              {t('apiKeySetup.changeLater')}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
