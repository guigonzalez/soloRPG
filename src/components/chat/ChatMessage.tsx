import { formatTime } from '../../utils/date';
import { SuggestedActions } from './SuggestedActions';
import type { Message, SuggestedAction } from '../../types/models';

interface ChatMessageProps {
  message: Message;
  suggestedActions?: SuggestedAction[];
  onSelectAction?: (action: SuggestedAction) => void;
  actionsDisabled?: boolean;
}

export function ChatMessage({ message, suggestedActions, onSelectAction, actionsDisabled }: ChatMessageProps) {
  const roleClass = message.role === 'user' ? 'user' : message.role === 'ai' ? 'ai' : 'system';

  return (
    <div className={`chat-message ${roleClass}`}>
      <div style={{ marginBottom: '4px', fontSize: '12px', opacity: 0.7 }}>
        {message.role === 'user' ? 'YOU' : message.role === 'ai' ? 'NARRATOR' : 'SYSTEM'} · {formatTime(message.createdAt)}
      </div>
      <div style={{ whiteSpace: 'pre-wrap' }}>
        {message.content}
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
