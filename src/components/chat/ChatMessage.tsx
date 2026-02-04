import React from 'react';
import { formatTime } from '../../utils/date';
import { SuggestedActions } from './SuggestedActions';
import { AttributeRollPrompt } from './AttributeRollPrompt';
import { splitTextWithAttributeRolls } from '../../utils/attribute-roll-parser';
import type { Message, SuggestedAction, Character } from '../../types/models';

interface ChatMessageProps {
  message: Message;
  suggestedActions?: SuggestedAction[];
  onSelectAction?: (action: SuggestedAction) => void;
  actionsDisabled?: boolean;
  character?: Character | null;
  campaignSystem?: string;
  onAttributeRoll?: (rollNotation: string, dc?: number) => void;
}

export function ChatMessage({
  message,
  suggestedActions,
  onSelectAction,
  actionsDisabled,
  character,
  campaignSystem,
  onAttributeRoll,
}: ChatMessageProps) {
  const roleClass = message.role === 'user' ? 'user' : message.role === 'ai' ? 'ai' : 'system';

  // Parse message content for attribute roll suggestions (only for AI messages)
  const shouldParseRolls = message.role === 'ai' && character && campaignSystem && onAttributeRoll;
  const textSegments = shouldParseRolls ? splitTextWithAttributeRolls(message.content) : null;

  return (
    <div className={`chat-message ${roleClass}`}>
      <div style={{ marginBottom: '4px', fontSize: '12px', opacity: 0.7 }}>
        {message.role === 'user' ? 'YOU' : message.role === 'ai' ? 'NARRATOR' : 'SYSTEM'} · {formatTime(message.createdAt)}
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
