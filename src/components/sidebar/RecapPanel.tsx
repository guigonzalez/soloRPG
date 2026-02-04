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
          Story So Far
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
          {isUpdating ? 'Updating...' : 'Update'}
        </button>
      </div>

      {!recap || !recap.summaryShort ? (
        <div className="recap-container" style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
          padding: '20px'
        }}>
          Click "Update" to generate a story recap from your adventure...
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
