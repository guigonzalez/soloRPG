import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { saveApiKey, validateApiKeyFormat, type AIProvider } from '../../services/storage/api-key-storage';

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
      setError('Please enter your API key');
      return;
    }

    if (!validateApiKeyFormat(apiKey, provider)) {
      if (provider === 'claude') {
        setError('Invalid API key format. It should start with "sk-ant-"');
      } else {
        setError('Invalid Gemini API key format');
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
        <Card title="Welcome to SoloRPG!">
          <div style={{ marginBottom: '24px', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '12px' }}>
              To start your adventure, you need to configure your AI provider API key.
            </p>
            <p style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Your API key is stored locally in your browser and never sent anywhere except directly to the provider's API.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">AI Provider</label>
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
                {provider === 'claude' ? 'Anthropic API Key' : 'Google AI API Key'}
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
                Don't have an API key?
              </div>

              {provider === 'claude' ? (
                <>
                  <ol style={{ marginLeft: '20px', marginBottom: '8px' }}>
                    <li>Go to <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
                    >
                      console.anthropic.com
                    </a></li>
                    <li>Sign up or log in</li>
                    <li>Navigate to "API Keys" section</li>
                    <li>Create a new key and copy it here</li>
                  </ol>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    Note: You'll need to add credit to your Anthropic account to use the API.
                  </div>
                </>
              ) : (
                <>
                  <ol style={{ marginLeft: '20px', marginBottom: '8px' }}>
                    <li>Go to <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
                    >
                      aistudio.google.com
                    </a></li>
                    <li>Sign in with your Google account</li>
                    <li>Click "Create API Key"</li>
                    <li>Copy the key and paste it here</li>
                  </ol>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    Note: Gemini has a generous free tier available.
                  </div>
                </>
              )}
            </div>

            <Button
              type="submit"
              disabled={isValidating || !apiKey.trim()}
              style={{ width: '100%' }}
            >
              {isValidating ? 'Saving...' : 'Save and Start Playing'}
            </Button>

            <div style={{
              marginTop: '12px',
              fontSize: '11px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}>
              You can change your API key later in the settings
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
