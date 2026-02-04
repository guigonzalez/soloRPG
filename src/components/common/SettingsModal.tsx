import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { saveApiKey, clearApiKey, getApiKey, getAIProvider, validateApiKeyFormat, type AIProvider } from '../../services/storage/api-key-storage';
import { getSettings, saveSettings, AVAILABLE_LANGUAGES } from '../../services/storage/settings-storage';

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
    if (confirm('Are you sure you want to remove your API key? You will need to enter it again to use AI features.')) {
      clearApiKey();
      window.location.reload();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 56, 15, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <Card title="Settings">
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '16px',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              API Key Configuration
            </h3>

            <div style={{
              padding: '12px',
              marginBottom: '16px',
              border: '2px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-primary)',
              fontSize: '14px',
            }}>
              <strong>Provider:</strong> {currentProvider === 'claude' ? 'Claude (Anthropic)' : 'Gemini (Google)'}
              <br />
              <strong>Status:</strong> {currentKey ? '✓ Configured' : '✗ Not configured'}
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
                    {showKey ? 'Hide' : 'Show'} current key
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
              <label className="form-label">AI Provider</label>
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
              <label className="form-label">New API Key</label>
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
                ✓ API key saved! Reloading...
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Button
                onClick={handleSave}
                disabled={!apiKey.trim() || success}
                style={{ flex: 1 }}
              >
                Save New Key
              </Button>
              {currentKey && (
                <Button onClick={handleClear} style={{ flex: 1 }}>
                  Remove Key
                </Button>
              )}
            </div>
          </div>

          <div style={{
            borderTop: '2px solid var(--color-border)',
            paddingTop: '24px',
            marginTop: '24px',
          }}>
            <h3 style={{
              fontSize: '16px',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              General Settings
            </h3>

            <div className="form-group">
              <label className="form-label">Language / Idioma</label>
              <select
                className="form-select"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  saveSettings({ language: e.target.value });
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
                AI narration and content will be generated in this language
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '2px solid var(--color-border)',
            paddingTop: '16px',
            marginTop: '16px',
          }}>
            <Button onClick={onClose} style={{ width: '100%' }}>
              Close
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
