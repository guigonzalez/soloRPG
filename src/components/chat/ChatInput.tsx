import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Button } from '../common/Button';
import { validateMessage } from '../../utils/validation';

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    const validationError = validateMessage(trimmed);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await onSendMessage(trimmed);
      setInput('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {error && (
          <div style={{
            color: 'var(--color-accent)',
            fontSize: '12px',
            padding: '4px 8px',
            border: '2px solid var(--color-accent)',
            backgroundColor: 'var(--color-bg-primary)'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            className="retro-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you do?"
            disabled={disabled || isSending}
            rows={3}
            style={{ flex: 1, resize: 'none', fontFamily: 'var(--font-family)' }}
          />

          <Button
            type="submit"
            disabled={disabled || isSending || !input.trim()}
            style={{ alignSelf: 'flex-end' }}
          >
            {isSending ? '...' : 'Send'}
          </Button>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  );
}
