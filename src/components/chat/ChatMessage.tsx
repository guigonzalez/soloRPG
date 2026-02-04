import React from 'react';
import { formatTime } from '../../utils/date';
import { SuggestedActions } from './SuggestedActions';
import { AttributeRollPrompt } from './AttributeRollPrompt';
import { splitTextWithAttributeRolls } from '../../utils/attribute-roll-parser';
import { t } from '../../services/i18n/use-i18n';
import type { Message, SuggestedAction, Character } from '../../types/models';

interface ChatMessageProps {
  message: Message;
  suggestedActions?: SuggestedAction[];
  onSelectAction?: (action: SuggestedAction) => void;
  actionsDisabled?: boolean;
  character?: Character | null;
  campaignSystem?: string;
  onAttributeRoll?: (rollNotation: string, dc?: number) => void;
  onResendMessage?: (content: string) => void;
  onContinueNarration?: () => void;
  isLastUserMessage?: boolean;
  isLastAIMessage?: boolean;
}

export function ChatMessage({
  message,
  suggestedActions,
  onSelectAction,
  actionsDisabled,
  character,
  campaignSystem,
  onAttributeRoll,
  onResendMessage,
  onContinueNarration,
  isLastUserMessage,
  isLastAIMessage,
}: ChatMessageProps) {
  const roleClass = message.role === 'user' ? 'user' : message.role === 'ai' ? 'ai' : 'system';

  // Parse message content for attribute roll suggestions (only for AI messages)
  const shouldParseRolls = message.role === 'ai' && character && campaignSystem && onAttributeRoll;
  const textSegments = shouldParseRolls ? splitTextWithAttributeRolls(message.content) : null;

  const handleResend = () => {
    if (onResendMessage && message.role === 'user') {
      onResendMessage(message.content);
    }
  };

  const handleContinue = () => {
    if (onContinueNarration && message.role === 'ai') {
      onContinueNarration();
    }
  };

  return (
    <div className={`chat-message ${roleClass}`}>
      <div style={{
        marginBottom: '4px',
        fontSize: '12px',
        opacity: 0.7,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          {message.role === 'user' ? 'YOU' : message.role === 'ai' ? 'NARRATOR' : 'SYSTEM'} · {formatTime(message.createdAt)}
        </div>
        {message.role === 'user' && isLastUserMessage && onResendMessage && (
          <button
            onClick={handleResend}
            disabled={actionsDisabled}
            style={{
              padding: '2px 6px',
              fontSize: '8px',
              fontFamily: '"Press Start 2P", monospace',
              backgroundColor: '#0f380f',
              color: '#9cd84e',
              border: '1px solid #9cd84e',
              cursor: actionsDisabled ? 'not-allowed' : 'pointer',
              opacity: actionsDisabled ? 0.5 : 1,
            }}
            title={t('chat.resendMessage')}
          >
            ↻ {t('chat.resendMessage').toUpperCase()}
          </button>
        )}
        {message.role === 'ai' && isLastAIMessage && onContinueNarration && (
          <button
            onClick={handleContinue}
            disabled={actionsDisabled}
            style={{
              padding: '2px 6px',
              fontSize: '8px',
              fontFamily: '"Press Start 2P", monospace',
              backgroundColor: '#0f380f',
              color: '#9cd84e',
              border: '1px solid #9cd84e',
              cursor: actionsDisabled ? 'not-allowed' : 'pointer',
              opacity: actionsDisabled ? 0.5 : 1,
            }}
            title={t('chat.continueNarration')}
          >
            ▶ {t('chat.continueNarration').toUpperCase()}
          </button>
        )}
      </div>
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {textSegments ? (
          textSegments.map((segment, index) => {
            if (segment.type === 'attribute-roll' && segment.suggestion) {
              return (
                <AttributeRollPrompt
                  key={`roll-${index}`}
                  attributeName={segment.suggestion.attributeName}
                  attributeAbbr={segment.suggestion.attributeAbbr}
                  dc={segment.suggestion.dc}
                  character={character!}
                  campaignSystem={campaignSystem!}
                  onRoll={onAttributeRoll!}
                  disabled={actionsDisabled}
                />
              );
            }
            return <React.Fragment key={`text-${index}`}>{segment.content}</React.Fragment>;
          })
        ) : (
          message.content
        )}
      </div>
      {suggestedActions && suggestedActions.length > 0 && onSelectAction && (
        <SuggestedActions
          actions={suggestedActions}
          onSelectAction={onSelectAction}
          disabled={actionsDisabled}
        />
      )}
    </div>
  );
}
