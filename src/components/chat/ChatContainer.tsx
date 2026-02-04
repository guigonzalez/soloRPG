import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { DiceRoll } from './DiceRoll';
import { Loading } from '../common/Loading';
import { t } from '../../services/i18n/use-i18n';
import type { Message, Roll, SuggestedAction, Character } from '../../types/models';

interface ChatContainerProps {
  messages: Message[];
  rolls: Roll[];
  onSendMessage: (content: string) => Promise<void>;
  onResendMessage?: (content: string) => Promise<void>;
  onContinueNarration?: () => Promise<void>;
  isAIResponding?: boolean;
  streamedContent?: string;
  suggestedActions?: SuggestedAction[];
  onSelectAction?: (action: SuggestedAction) => void;
  character?: Character | null;
  campaignSystem?: string;
  onAttributeRoll?: (rollNotation: string, dc?: number) => void;
}

/**
 * Merge messages and rolls into chronological order
 */
function mergeMessagesAndRolls(messages: Message[], rolls: Roll[]): Array<{ type: 'message' | 'roll'; data: Message | Roll }> {
  const merged = [
    ...messages.map(m => ({ type: 'message' as const, data: m, timestamp: m.createdAt })),
    ...rolls.map(r => ({ type: 'roll' as const, data: r, timestamp: r.createdAt })),
  ];

  return merged.sort((a, b) => a.timestamp - b.timestamp);
}

export function ChatContainer({
  messages,
  rolls,
  onSendMessage,
  onResendMessage,
  onContinueNarration,
  isAIResponding = false,
  streamedContent = '',
  suggestedActions = [],
  onSelectAction,
  character,
  campaignSystem,
  onAttributeRoll,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const merged = mergeMessagesAndRolls(messages, rolls);

  // Find the last AI message index
  const lastAIMessageIndex = messages.length > 0
    ? messages.map((m, i) => m.role === 'ai' ? i : -1).filter(i => i !== -1).pop()
    : -1;

  // Find the last user message index
  const lastUserMessageIndex = messages.length > 0
    ? messages.map((m, i) => m.role === 'user' ? i : -1).filter(i => i !== -1).pop()
    : -1;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, rolls, streamedContent]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {merged.length === 0 && !isAIResponding && (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: 'var(--color-text-secondary)'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '16px' }}>
              {t('chat.adventureBegins')}
            </div>
            <div style={{ fontSize: '14px' }}>
              {t('chat.firstActionPrompt')}
            </div>
          </div>
        )}

        {merged.map((item) => {
          if (item.type === 'roll') {
            return <DiceRoll key={`roll-${item.data.id}`} roll={item.data as Roll} />;
          }

          const message = item.data as Message;
          const messageIndex = messages.findIndex(m => m.id === message.id);
          const isLastAIMessage = messageIndex === lastAIMessageIndex;
          const isLastUserMessage = messageIndex === lastUserMessageIndex;
          const showActions = isLastAIMessage && suggestedActions.length > 0 && !isAIResponding;

          return (
            <ChatMessage
              key={`msg-${message.id}`}
              message={message}
              suggestedActions={showActions ? suggestedActions : undefined}
              onSelectAction={onSelectAction}
              actionsDisabled={isAIResponding}
              character={character}
              campaignSystem={campaignSystem}
              onAttributeRoll={onAttributeRoll}
              onResendMessage={onResendMessage || onSendMessage}
              onContinueNarration={onContinueNarration}
              isLastUserMessage={isLastUserMessage}
              isLastAIMessage={isLastAIMessage}
            />
          );
        })}

        {/* Show AI response as it's being streamed */}
        {isAIResponding && streamedContent && (
          <div className="chat-message ai">
            <div style={{ marginBottom: '4px', fontSize: '12px', opacity: 0.7 }}>
              {t('chat.narratorTyping')}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {streamedContent}
              <span className="blink">▮</span>
            </div>
          </div>
        )}

        {/* Loading indicator without streamed content yet */}
        {isAIResponding && !streamedContent && (
          <div style={{ padding: '16px' }}>
            <Loading message={t('chat.narratorThinking')} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isAIResponding}
      />
    </div>
  );
}
