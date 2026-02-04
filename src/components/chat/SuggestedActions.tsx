import { Button } from '../common/Button';
import { t } from '../../services/i18n/use-i18n';
import type { SuggestedAction } from '../../types/models';

interface SuggestedActionsProps {
  actions: SuggestedAction[];
  onSelectAction: (action: SuggestedAction) => void;
  disabled?: boolean;
}

export function SuggestedActions({ actions, onSelectAction, disabled }: SuggestedActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div style={{
      marginTop: '16px',
      padding: '12px',
      border: '2px solid var(--color-border)',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    }}>
      <div style={{
        fontSize: '12px',
        marginBottom: '8px',
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>
        {t('chat.suggestedActions')}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {actions.map((action) => (
          <Button
            key={action.id}
            onClick={() => onSelectAction(action)}
            disabled={disabled}
            style={{
              width: '100%',
              textAlign: 'left',
              position: 'relative',
              fontSize: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{action.label}</span>
              {action.rollNotation && (
                <span style={{
                  fontSize: '11px',
                  opacity: 0.7,
                  marginLeft: '8px',
                }}>
                  {action.rollNotation} {action.dc ? `${t('chat.dc')} ${action.dc}` : ''}
                </span>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
