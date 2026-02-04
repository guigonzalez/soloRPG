import { Button } from '../common/Button';

interface RollButtonProps {
  notation: string | null;
  onRoll: () => void;
  disabled?: boolean;
}

export function RollButton({ notation, onRoll, disabled = false }: RollButtonProps) {
  if (!notation) {
    return (
      <div style={{
        padding: '16px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: '14px'
      }}>
        Roll button will appear when needed...
      </div>
    );
  }

  return (
    <div className="roll-button-container">
      <div className="roll-notation">{notation}</div>
      <Button onClick={onRoll} disabled={disabled}>
        Roll Dice
      </Button>
      <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
        Click to roll and continue the story
      </div>
    </div>
  );
}
