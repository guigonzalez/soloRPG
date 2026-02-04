import { useState } from 'react';
import type { Character } from '../../types/models';
import { getSystemTemplate, getAttributeModifier } from '../../services/game/attribute-templates';
import { getNextLevelXP } from '../../services/game/experience-calculator';
import { t } from '../../services/i18n/use-i18n';

interface CharacterPanelProps {
  character: Character;
  campaignSystem: string;
}

/**
 * Character Panel - Displays character stats in sidebar
 */
export function CharacterPanel({ character, campaignSystem }: CharacterPanelProps) {
  const template = getSystemTemplate(campaignSystem);
  const nextLevelXP = getNextLevelXP(character.level, template.experienceTable);
  const xpProgress = nextLevelXP !== Infinity
    ? ((character.experience / nextLevelXP) * 100).toFixed(0)
    : 100;

  const [showBackstory, setShowBackstory] = useState(false);

  // Check if character has any backstory information
  const hasBackstory = character.backstory || character.personality || character.goals || character.fears;

  return (
    <div className="character-panel">
      {/* Character Header */}
      <div style={{
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '2px solid #9cd84e',
      }}>
        <h3 style={{
          fontSize: '14px',
          marginBottom: '8px',
          color: '#9cd84e',
        }}>
          {character.name}
        </h3>
        <div style={{
          fontSize: '12px',
          color: '#6a8f3a',
        }}>
          {t('characterPanel.level')} {character.level}
        </div>
      </div>

      {/* XP Progress */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '10px', color: '#9cd84e' }}>
            {t('characterPanel.experience')}
          </span>
          <span style={{ fontSize: '10px', color: '#6a8f3a' }}>
            {character.experience} / {nextLevelXP === Infinity ? t('characterPanel.maxLevel') : nextLevelXP}
          </span>
        </div>
        <div style={{
          height: '12px',
          backgroundColor: '#0f380f',
          border: '2px solid #9cd84e',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${xpProgress}%`,
            backgroundColor: '#9cd84e',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Hit Points */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '10px', color: '#ff6b6b' }}>
            {t('characterPanel.hitPoints')}
          </span>
          <span style={{ fontSize: '10px', color: '#c92a2a' }}>
            {character.hitPoints} / {character.maxHitPoints}
          </span>
        </div>
        <div style={{
          height: '12px',
          backgroundColor: '#0f380f',
          border: '2px solid #ff6b6b',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${((character.hitPoints / character.maxHitPoints) * 100).toFixed(0)}%`,
            backgroundColor: character.hitPoints <= character.maxHitPoints * 0.25
              ? '#c92a2a' // Critical HP - darker red
              : character.hitPoints <= character.maxHitPoints * 0.5
              ? '#ff6b6b' // Low HP - orange-red
              : '#fa5252', // Healthy HP - bright red
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }} />
        </div>
      </div>

      {/* System-specific Resources (Sanity, Magic Points, Blood Points, etc.) */}
      {template.resources && character.resources && character.maxResources && (
        <div style={{ marginBottom: '16px' }}>
          {template.resources.map((resourceDef) => {
            const currentValue = character.resources![resourceDef.name] || 0;
            const maxValue = character.maxResources![resourceDef.name] || 0;
            const percentage = maxValue > 0 ? ((currentValue / maxValue) * 100).toFixed(0) : '0';
            const barColor = resourceDef.color || '#9370db';

            return (
              <div key={resourceDef.name} style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '10px', color: barColor }}>
                    {resourceDef.displayName}
                  </span>
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>
                    {currentValue} / {maxValue}
                  </span>
                </div>
                <div style={{
                  height: '10px',
                  backgroundColor: '#0f380f',
                  border: `2px solid ${barColor}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attributes */}
      <div style={{ marginBottom: hasBackstory ? '16px' : '0' }}>
        <h4 style={{
          fontSize: '12px',
          marginBottom: '12px',
          color: '#9cd84e',
        }}>
          {t('characterPanel.attributes')}
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        }}>
          {template.attributes.map((attrDef) => {
            const value = character.attributes[attrDef.name] || 0;
            const modifier = getAttributeModifier(value, template);

            return (
              <div
                key={attrDef.name}
                style={{
                  padding: '8px',
                  backgroundColor: '#0f380f',
                  border: '1px solid #9cd84e',
                }}
                title={attrDef.description}
              >
                <div style={{
                  fontSize: '10px',
                  color: '#6a8f3a',
                  marginBottom: '4px',
                }}>
                  {attrDef.displayName}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#9cd84e',
                    fontWeight: 'bold',
                  }}>
                    {value}
                  </span>
                  {modifier !== undefined && (
                    <span style={{
                      fontSize: '10px',
                      color: '#6a8f3a',
                    }}>
                      ({modifier >= 0 ? '+' : ''}{modifier})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backstory Section */}
      {hasBackstory && (
        <div>
          <button
            onClick={() => setShowBackstory(!showBackstory)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '12px',
              fontFamily: '"Press Start 2P", monospace',
              backgroundColor: '#0f380f',
              color: '#9cd84e',
              border: '2px solid #9cd84e',
              cursor: 'pointer',
              marginBottom: showBackstory ? '12px' : '0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{t('characterCreation.backgroundTab')}</span>
            <span>{showBackstory ? '▼' : '▶'}</span>
          </button>

          {showBackstory && (
            <div style={{
              padding: '12px',
              backgroundColor: '#0f380f',
              border: '1px solid #9cd84e',
              fontSize: '10px',
              lineHeight: '1.6',
            }}>
              {character.backstory && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: '#9cd84e',
                    marginBottom: '6px',
                    fontWeight: 'bold',
                  }}>
                    {t('characterCreation.backstory')}
                  </div>
                  <div style={{
                    color: '#6a8f3a',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {character.backstory}
                  </div>
                </div>
              )}

              {character.personality && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: '#9cd84e',
                    marginBottom: '6px',
                    fontWeight: 'bold',
                  }}>
                    {t('characterCreation.personality')}
                  </div>
                  <div style={{
                    color: '#6a8f3a',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {character.personality}
                  </div>
                </div>
              )}

              {character.goals && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: '#9cd84e',
                    marginBottom: '6px',
                    fontWeight: 'bold',
                  }}>
                    {t('characterCreation.goals')}
                  </div>
                  <div style={{
                    color: '#6a8f3a',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {character.goals}
                  </div>
                </div>
              )}

              {character.fears && (
                <div>
                  <div style={{
                    fontSize: '10px',
                    color: '#9cd84e',
                    marginBottom: '6px',
                    fontWeight: 'bold',
                  }}>
                    {t('characterCreation.fears')}
                  </div>
                  <div style={{
                    color: '#6a8f3a',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {character.fears}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
