import { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { getSheetPreset, type SheetPreset } from '../../services/game/sheet-presets';
import { t } from '../../services/i18n/use-i18n';
import type { Character } from '../../types/models';

interface LevelUpModalProps {
  character: Character;
  campaignSystem: string;
  attributePoints: number;
  onConfirm: (attributeAllocations: Record<string, number>) => void;
}

/**
 * Level Up Modal
 * Allows player to allocate attribute points after leveling up
 */
export function LevelUpModal({
  character,
  campaignSystem,
  attributePoints,
  onConfirm,
}: LevelUpModalProps) {
  const preset: SheetPreset = getSheetPreset(campaignSystem);

  // Track how many points have been allocated to each attribute
  const [pointsAllocated, setPointsAllocated] = useState<Record<string, number>>({});

  // Calculate remaining points
  const pointsRemaining =
    attributePoints - Object.values(pointsAllocated).reduce((sum, v) => sum + v, 0);

  // Handle incrementing an attribute
  const handleIncrement = (attrName: string) => {
    const attrDef = preset.attributes.find((a) => a.name === attrName);
    if (!attrDef) return;

    // Check if we have points remaining
    if (pointsRemaining <= 0) return;

    // Check if attribute is at max value
    const currentValue = character.attributes[attrName] || 0;
    const allocated = pointsAllocated[attrName] || 0;
    const newValue = currentValue + allocated + 1;

    if (newValue > attrDef.maxValue) return;

    setPointsAllocated((prev) => ({
      ...prev,
      [attrName]: allocated + 1,
    }));
  };

  // Handle decrementing an attribute (undo allocation)
  const handleDecrement = (attrName: string) => {
    const allocated = pointsAllocated[attrName] || 0;
    if (allocated <= 0) return;

    setPointsAllocated((prev) => ({
      ...prev,
      [attrName]: allocated - 1,
    }));
  };

  // Handle confirm button
  const handleConfirm = () => {
    onConfirm(pointsAllocated);
  };

  return (
    <div className="page-overlay">
      <div className="page-modal">
        <div className="page-hero" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="page-hero-badge">⬆️ {t('levelUp.title')}</div>
          <h1 className="page-hero-title">
            {t('levelUp.youAreNowLevel')} {character.level}
          </h1>
          <p className="page-hero-tagline">
            {attributePoints === 1
              ? t('levelUp.allocatePoint', { count: attributePoints })
              : t('levelUp.allocatePoints', { count: attributePoints })}
          </p>
        </div>

        <Card title="">

          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
              }}
            >
              {preset.attributes.map((attrDef) => {
                const currentValue = character.attributes[attrDef.name] || 0;
                const allocated = pointsAllocated[attrDef.name] || 0;
                const newValue = currentValue + allocated;
                const modifier = preset.modifierCalculation?.(newValue);

                return (
                  <div key={attrDef.name} className="char-attr-card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <div>
                        <div className="char-field-label" style={{ marginBottom: '4px', fontSize: '12px' }}>
                          {attrDef.displayName}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                          {attrDef.description}
                        </div>
                      </div>
                      {modifier !== undefined && (
                        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                          ({modifier >= 0 ? '+' : ''}
                          {modifier})
                        </div>
                      )}
                    </div>

                    {/* Current value display */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <span className="char-attr-value" style={{ fontSize: '14px' }}>
                        {currentValue}
                        {allocated > 0 && (
                          <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                            → {newValue}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Increment/Decrement buttons */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center',
                      }}
                    >
                      <button
                        className="char-btn-sm"
                        onClick={() => handleDecrement(attrDef.name)}
                        disabled={allocated <= 0}
                      >
                        -
                      </button>

                      <div
                        style={{
                          width: '60px',
                          textAlign: 'center',
                          fontSize: '14px',
                          color: 'var(--color-accent)',
                        }}
                      >
                        +{allocated}
                      </div>

                      <button
                        className="char-btn-sm"
                        onClick={() => handleIncrement(attrDef.name)}
                        disabled={
                          pointsRemaining <= 0 || newValue >= attrDef.maxValue
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              marginBottom: '24px',
              textAlign: 'center',
              fontSize: '14px',
              color: pointsRemaining > 0 ? '#e74c3c' : 'var(--color-accent)',
            }}
          >
            {t('levelUp.pointsRemaining')}: {pointsRemaining}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button onClick={handleConfirm} disabled={pointsRemaining > 0}>
              {t('levelUp.confirmLevelUp')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
