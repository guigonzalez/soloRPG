export function ApiKeyWarning() {
  const hasApiKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (hasApiKey) {
    return null;
  }

  return (
    <div style={{
      padding: '16px',
      margin: '16px',
      border: '2px solid var(--color-accent)',
      backgroundColor: 'var(--color-bg-secondary)',
      color: 'var(--color-accent)',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
        ⚠️ API Key Not Configured
      </div>
      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
        To use AI narration, you need to:
        <ol style={{ marginTop: '8px', marginLeft: '20px' }}>
          <li>Create a <code>.env</code> file in the project root</li>
          <li>Add your Anthropic API key:</li>
        </ol>
        <pre style={{
          marginTop: '8px',
          padding: '8px',
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border)',
          fontSize: '12px',
          overflow: 'auto',
        }}>
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
        </pre>
        <div style={{ marginTop: '8px', fontSize: '12px' }}>
          Get your API key at: <a
            href="https://console.anthropic.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
          >
            console.anthropic.com
          </a>
        </div>
      </div>
    </div>
  );
}
