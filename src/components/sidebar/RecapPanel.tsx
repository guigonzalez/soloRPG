import { t } from '../../services/i18n/use-i18n';
import type { Recap } from '../../types/models';

interface RecapPanelProps {
  recap: Recap | null;
  onUpdateRecap: () => void;
  isUpdating: boolean;
}

export function RecapPanel({ recap, onUpdateRecap, isUpdating }: RecapPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'var(--color-accent)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {t('recapPanel.title')}
        </div>
        <button
          className="retro-button"
          onClick={onUpdateRecap}
          disabled={isUpdating}
          style={{
            fontSize: '10px',
            padding: '4px 8px',
            minWidth: 'auto'
          }}
        >
          {isUpdating ? t('recapPanel.updating') : t('recapPanel.update')}
        </button>
      </div>

      {!recap || !recap.summaryShort ? (
        <div className="recap-container" style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
          padding: '20px'
        }}>
          {t('recapPanel.clickUpdate')}
        </div>
      ) : (
        <div className="recap-container" style={{
          fontSize: '14px',
          lineHeight: '1.8',
          padding: '16px'
        }}>
          {recap.summaryShort}
        </div>
      )}
    </div>
  );
}
