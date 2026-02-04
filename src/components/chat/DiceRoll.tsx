import type { Roll } from '../../types/models';
import { formatTime } from '../../utils/date';

interface DiceRollProps {
  roll: Roll;
}

export function DiceRoll({ roll }: DiceRollProps) {
  return (
    <div className="chat-message system" style={{ maxWidth: '400px' }}>
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
          DICE ROLL · {formatTime(roll.createdAt)}
        </div>

        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--color-accent)',
          letterSpacing: '2px',
          marginBottom: '8px',
          textAlign: 'center',
        }}>
          {roll.notation}
        </div>
      </div>

      <div style={{
        fontSize: '14px',
        padding: '8px',
        backgroundColor: 'var(--color-bg-primary)',
        border: '2px solid var(--color-border)',
        marginBottom: '8px',
      }}>
        {roll.breakdown}
      </div>

      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: 'var(--color-accent)',
        textAlign: 'center',
        letterSpacing: '4px',
      }}>
        = {roll.result}
      </div>
    </div>
  );
}
