import { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { getSystemTemplate, isValidAttributeValue, type AttributeDefinition, type SystemTemplate } from '../../services/game/attribute-templates';

interface CharacterCreationProps {
  campaignSystem: string;
  campaignTheme: string;
  onConfirm: (name: string, attributes: Record<string, number>) => void;
  onCancel: () => void;
}

/**
 * Character Creation Modal
 * Allows player to customize character name and attributes
 * AI suggests initial values, player can adjust
 */
export function CharacterCreation({
  campaignSystem,
  campaignTheme,
  onConfirm,
  onCancel,
}: CharacterCreationProps) {
  const template: SystemTemplate = getSystemTemplate(campaignSystem);

  // Generate suggested name based on theme
  const suggestName = () => {
    const themes: Record<string, string[]> = {
      fantasy: ['Aric', 'Elara', 'Thorne', 'Lyra', 'Kael', 'Nyx'],
      scifi: ['Nova', 'Cipher', 'Raven', 'Zephyr', 'Echo', 'Axel'],
      horror: ['Morgan', 'Ash', 'Reed', 'Salem', 'Quinn', 'Blake'],
      cyberpunk: ['Neon', 'Glitch', 'Razor', 'Ghost', 'Vex', 'Wire'],
      default: ['Alex', 'Jordan', 'Riley', 'Morgan', 'Casey', 'Drew'],
    };

    const themeKey = Object.keys(themes).find(key =>
      campaignTheme.toLowerCase().includes(key)
    ) || 'default';

    const names = themes[themeKey];
    return names[Math.floor(Math.random() * names.length)];
  };

  // Initialize state with suggested values
  const [characterName, setCharacterName] = useState<string>(suggestName());
  const [attributes, setAttributes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    template.attributes.forEach(attr => {
      initial[attr.name] = attr.defaultValue;
    });
    return initial;
  });

  // Handle attribute change with validation
  const handleAttributeChange = (attrName: string, delta: number) => {
    const attrDef = template.attributes.find(a => a.name === attrName);
    if (!attrDef) return;

    const newValue = attributes[attrName] + delta;

    if (isValidAttributeValue(newValue, attrDef)) {
      setAttributes(prev => ({
        ...prev,
        [attrName]: newValue,
      }));
    }
  };

  // Randomize all attributes
  const handleRandomize = () => {
    const newAttributes: Record<string, number> = {};

    template.attributes.forEach(attr => {
      // Generate random value within range
      // For D&D-like systems, simulate 3d6 or 4d6 drop lowest
      const range = attr.maxValue - attr.minValue;
      const variance = Math.floor(range * 0.3); // 30% variance from default
      const randomValue = attr.defaultValue + Math.floor(Math.random() * variance * 2) - variance;

      // Clamp to min/max
      newAttributes[attr.name] = Math.max(
        attr.minValue,
        Math.min(attr.maxValue, randomValue)
      );
    });

    setAttributes(newAttributes);
    setCharacterName(suggestName());
  };

  // Handle confirm
  const handleConfirm = () => {
    if (!characterName.trim()) {
      alert('Please enter a character name');
      return;
    }

    onConfirm(characterName.trim(), attributes);
  };

  return (
    <div style={{
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
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <Card title={`Create Your Character - ${campaignSystem}`}>
          {/* Character Name */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: '#9cd84e',
            }}>
              Character Name
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Enter name..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontFamily: '"Press Start 2P", monospace',
                backgroundColor: '#0f380f',
                color: '#9cd84e',
                border: '2px solid #9cd84e',
                borderRadius: '0',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Attributes */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <label style={{
                fontSize: '14px',
                color: '#9cd84e',
              }}>
                Attributes
              </label>
              <button
                onClick={handleRandomize}
                style={{
                  padding: '6px 12px',
                  fontSize: '10px',
                  fontFamily: '"Press Start 2P", monospace',
                  backgroundColor: '#0f380f',
                  color: '#9cd84e',
                  border: '2px solid #9cd84e',
                  cursor: 'pointer',
                }}
              >
                Randomize
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
            }}>
              {template.attributes.map((attrDef: AttributeDefinition) => {
                const value = attributes[attrDef.name];
                const modifier = template.modifierCalculation?.(value);

                return (
                  <div
                    key={attrDef.name}
                    style={{
                      padding: '12px',
                      backgroundColor: '#0f380f',
                      border: '2px solid #9cd84e',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}>
                      <div>
                        <div style={{
                          fontSize: '12px',
                          color: '#9cd84e',
                          marginBottom: '4px',
                        }}>
                          {attrDef.displayName}
                        </div>
                        <div style={{
                          fontSize: '8px',
                          color: '#6a8f3a',
                        }}>
                          {attrDef.description}
                        </div>
                      </div>
                      {modifier !== undefined && (
                        <div style={{
                          fontSize: '10px',
                          color: '#6a8f3a',
                        }}>
                          ({modifier >= 0 ? '+' : ''}{modifier})
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <button
                        onClick={() => handleAttributeChange(attrDef.name, -1)}
                        disabled={value <= attrDef.minValue}
                        style={{
                          width: '30px',
                          height: '30px',
                          fontSize: '14px',
                          fontFamily: '"Press Start 2P", monospace',
                          backgroundColor: '#0f380f',
                          color: '#9cd84e',
                          border: '2px solid #9cd84e',
                          cursor: value <= attrDef.minValue ? 'not-allowed' : 'pointer',
                          opacity: value <= attrDef.minValue ? 0.5 : 1,
                        }}
                      >
                        -
                      </button>

                      <div style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '16px',
                        color: '#9cd84e',
                      }}>
                        {value}
                      </div>

                      <button
                        onClick={() => handleAttributeChange(attrDef.name, 1)}
                        disabled={value >= attrDef.maxValue}
                        style={{
                          width: '30px',
                          height: '30px',
                          fontSize: '14px',
                          fontFamily: '"Press Start 2P", monospace',
                          backgroundColor: '#0f380f',
                          color: '#9cd84e',
                          border: '2px solid #9cd84e',
                          cursor: value >= attrDef.maxValue ? 'not-allowed' : 'pointer',
                          opacity: value >= attrDef.maxValue ? 0.5 : 1,
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{
                      marginTop: '8px',
                      fontSize: '8px',
                      color: '#6a8f3a',
                      textAlign: 'center',
                    }}>
                      Range: {attrDef.minValue}-{attrDef.maxValue}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}>
            <Button onClick={onCancel} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Create Character
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
