import { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { getSystemTemplate, type SystemTemplate } from '../../services/game/attribute-templates';
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
  const template: SystemTemplate = getSystemTemplate(campaignSystem);

  // Track how many points have been allocated to each attribute
  const [pointsAllocated, setPointsAllocated] = useState<Record<string, number>>({});

  // Calculate remaining points
  const pointsRemaining =
    attributePoints - Object.values(pointsAllocated).reduce((sum, v) => sum + v, 0);

  // Handle incrementing an attribute
  const handleIncrement = (attrName: string) => {
    const attrDef = template.attributes.find((a) => a.name === attrName);
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 56, 15, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <Card title={t('levelUp.title')}>
          {/* Level Up Header */}
          <div
            style={{
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '16px',
                marginBottom: '8px',
                color: '#9cd84e',
              }}
            >
              {t('levelUp.youAreNowLevel')} <strong>{character.level}</strong>
            </p>
            <p
              style={{
                fontSize: '14px',
                color: '#6a8f3a',
              }}
            >
              {attributePoints === 1
                ? t('levelUp.allocatePoint', { count: attributePoints })
                : t('levelUp.allocatePoints', { count: attributePoints })}
            </p>
          </div>

          {/* Attribute Allocation */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
              }}
            >
              {template.attributes.map((attrDef) => {
                const currentValue = character.attributes[attrDef.name] || 0;
                const allocated = pointsAllocated[attrDef.name] || 0;
                const newValue = currentValue + allocated;
                const modifier = template.modifierCalculation?.(newValue);

                return (
                  <div
                    key={attrDef.name}
                    style={{
                      padding: '12px',
                      backgroundColor: '#0f380f',
                      border: '2px solid #9cd84e',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#9cd84e',
                            marginBottom: '4px',
                          }}
                        >
                          {attrDef.displayName}
                        </div>
                        <div
                          style={{
                            fontSize: '8px',
                            color: '#6a8f3a',
                          }}
                        >
                          {attrDef.description}
                        </div>
                      </div>
                      {modifier !== undefined && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#6a8f3a',
                          }}
                        >
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
                      <span
                        style={{
                          fontSize: '14px',
                          color: allocated > 0 ? '#9cd84e' : '#6a8f3a',
                        }}
                      >
                        {currentValue}
                        {allocated > 0 && (
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#9cd84e',
                              marginLeft: '4px',
                            }}
                          >
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
                        onClick={() => handleDecrement(attrDef.name)}
                        disabled={allocated <= 0}
                        style={{
                          width: '30px',
                          height: '30px',
                          fontSize: '14px',
                          fontFamily: '"Press Start 2P", monospace',
                          backgroundColor: '#0f380f',
                          color: '#9cd84e',
                          border: '2px solid #9cd84e',
                          cursor: allocated <= 0 ? 'not-allowed' : 'pointer',
                          opacity: allocated <= 0 ? 0.5 : 1,
                        }}
                      >
                        -
                      </button>

                      <div
                        style={{
                          width: '60px',
                          textAlign: 'center',
                          fontSize: '14px',
                          color: '#9cd84e',
                        }}
                      >
                        +{allocated}
                      </div>

                      <button
                        onClick={() => handleIncrement(attrDef.name)}
                        disabled={
                          pointsRemaining <= 0 || newValue >= attrDef.maxValue
                        }
                        style={{
                          width: '30px',
                          height: '30px',
                          fontSize: '14px',
                          fontFamily: '"Press Start 2P", monospace',
                          backgroundColor: '#0f380f',
                          color: '#9cd84e',
                          border: '2px solid #9cd84e',
                          cursor:
                            pointsRemaining <= 0 || newValue >= attrDef.maxValue
                              ? 'not-allowed'
                              : 'pointer',
                          opacity:
                            pointsRemaining <= 0 || newValue >= attrDef.maxValue
                              ? 0.5
                              : 1,
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points Remaining */}
          <div
            style={{
              marginBottom: '24px',
              textAlign: 'center',
              fontSize: '14px',
              color: pointsRemaining > 0 ? '#d84e4e' : '#9cd84e',
            }}
          >
            {t('levelUp.pointsRemaining')}: {pointsRemaining}
          </div>

          {/* Confirm Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button onClick={handleConfirm} disabled={pointsRemaining > 0}>
              {t('levelUp.confirmLevelUp')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
