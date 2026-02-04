import { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import {
  getSystemTemplate,
  isValidAttributeValue,
  calculateTotalPointCost,
  isValidAttributeChange,
  type AttributeDefinition,
  type SystemTemplate
} from '../../services/game/attribute-templates';
import { t } from '../../services/i18n/use-i18n';
import { getGameEngine } from '../../services/game/game-engine';

interface CharacterCreationProps {
  campaignSystem: string;
  campaignTheme: string;
  onConfirm: (
    name: string,
    attributes: Record<string, number>,
    backstory?: string,
    personality?: string,
    goals?: string,
    fears?: string
  ) => void;
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

  // Backstory and personality fields
  const [backstory, setBackstory] = useState<string>('');
  const [personality, setPersonality] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  const [fears, setFears] = useState<string>('');

  // Tab state
  const [activeTab, setActiveTab] = useState<'basic' | 'attributes' | 'background'>('basic');

  // AI generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Handle attribute change with validation
  const handleAttributeChange = (attrName: string, delta: number) => {
    const attrDef = template.attributes.find(a => a.name === attrName);
    if (!attrDef) return;

    const newValue = attributes[attrName] + delta;

    // Check basic attribute limits
    if (!isValidAttributeValue(newValue, attrDef)) return;

    // Check point-buy limits if system uses it
    if (template.pointBuy && !isValidAttributeChange(attributes, attrName, newValue, template)) {
      return; // Would exceed point budget
    }

    setAttributes(prev => ({
      ...prev,
      [attrName]: newValue,
    }));
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

  // Generate character background with AI
  const handleGenerateBackground = async () => {
    if (!characterName.trim()) {
      alert(t('characterCreation.nameRequired'));
      return;
    }

    setIsGenerating(true);
    try {
      const gameEngine = getGameEngine();
      const background = await gameEngine.generateCharacterBackground(
        characterName,
        campaignTheme,
        campaignSystem,
        attributes
      );

      setBackstory(background.backstory);
      setPersonality(background.personality);
      setGoals(background.goals);
      setFears(background.fears);
    } catch (error) {
      console.error('Error generating background:', error);

      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          alert(t('characterCreation.apiKeyRequired'));
        } else if (error.message.includes('authentication_error') || error.message.includes('Invalid API key')) {
          alert(t('characterCreation.invalidApiKey'));
        } else {
          alert(t('characterCreation.generationFailed'));
        }
      } else {
        alert(t('characterCreation.generationFailed'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    if (!characterName.trim()) {
      alert(t('characterCreation.nameRequired'));
      return;
    }

    onConfirm(
      characterName.trim(),
      attributes,
      backstory.trim() || undefined,
      personality.trim() || undefined,
      goals.trim() || undefined,
      fears.trim() || undefined
    );
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
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Card title={`${t('characterCreation.title')} - ${campaignSystem}`}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '24px',
            borderBottom: '2px solid #9cd84e',
          }}>
            <button
              onClick={() => setActiveTab('basic')}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '10px',
                fontFamily: '"Press Start 2P", monospace',
                backgroundColor: activeTab === 'basic' ? '#9cd84e' : '#0f380f',
                color: activeTab === 'basic' ? '#0f380f' : '#9cd84e',
                border: 'none',
                borderBottom: activeTab === 'basic' ? 'none' : '2px solid #9cd84e',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {t('characterCreation.basicTab')}
            </button>
            <button
              onClick={() => setActiveTab('attributes')}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '10px',
                fontFamily: '"Press Start 2P", monospace',
                backgroundColor: activeTab === 'attributes' ? '#9cd84e' : '#0f380f',
                color: activeTab === 'attributes' ? '#0f380f' : '#9cd84e',
                border: 'none',
                borderBottom: activeTab === 'attributes' ? 'none' : '2px solid #9cd84e',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {t('characterCreation.attributesTab')}
            </button>
            <button
              onClick={() => setActiveTab('background')}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '10px',
                fontFamily: '"Press Start 2P", monospace',
                backgroundColor: activeTab === 'background' ? '#9cd84e' : '#0f380f',
                color: activeTab === 'background' ? '#0f380f' : '#9cd84e',
                border: 'none',
                borderBottom: activeTab === 'background' ? 'none' : '2px solid #9cd84e',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {t('characterCreation.backgroundTab')}
            </button>
          </div>

          {/* Scrollable content area */}
          <div style={{
            maxHeight: 'calc(90vh - 250px)',
            overflowY: 'auto',
            paddingRight: '8px',
            marginBottom: '24px',
          }}>
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: '#9cd84e',
                }}>
                  {t('characterCreation.characterName')}
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder={t('characterCreation.characterNamePlaceholder')}
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
            )}

            {/* Attributes Tab */}
            {activeTab === 'attributes' && (
              <div>
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
                    {t('characterCreation.attributes')}
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
                    {t('characterCreation.randomize')}
                  </button>
                </div>

                {/* Point-buy counter */}
                {template.pointBuy && (() => {
                  const pointsUsed = calculateTotalPointCost(attributes, template);
                  const pointsRemaining = template.pointBuy.totalPoints - pointsUsed;
                  const isOverBudget = pointsRemaining < 0;

                  return (
                    <div style={{
                      padding: '12px',
                      marginBottom: '16px',
                      backgroundColor: '#0f380f',
                      border: `2px solid ${isOverBudget ? '#ff6b6b' : '#9cd84e'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '10px', color: '#9cd84e' }}>
                        Points Available
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: isOverBudget ? '#ff6b6b' : '#9cd84e',
                      }}>
                        {pointsRemaining} / {template.pointBuy.totalPoints}
                      </span>
                    </div>
                  );
                })()}

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
                          {t('characterCreation.range')}: {attrDef.minValue}-{attrDef.maxValue}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Background Tab */}
            {activeTab === 'background' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#9cd84e',
                  }}>
                    {t('characterCreation.backgroundOptional')}
                  </div>
                  <button
                    onClick={handleGenerateBackground}
                    disabled={isGenerating || !characterName.trim()}
                    style={{
                      padding: '6px 12px',
                      fontSize: '10px',
                      fontFamily: '"Press Start 2P", monospace',
                      backgroundColor: '#0f380f',
                      color: '#9cd84e',
                      border: '2px solid #9cd84e',
                      cursor: isGenerating || !characterName.trim() ? 'not-allowed' : 'pointer',
                      opacity: isGenerating || !characterName.trim() ? 0.5 : 1,
                    }}
                  >
                    {isGenerating ? t('characterCreation.generating') : t('characterCreation.generateWithAI')}
                  </button>
                </div>

                {/* Backstory */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    marginBottom: '6px',
                    color: '#9cd84e',
                  }}>
                    {t('characterCreation.backstory')}
                  </label>
                  <textarea
                    value={backstory}
                    onChange={(e) => setBackstory(e.target.value)}
                    placeholder={t('characterCreation.backstoryPlaceholder')}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      backgroundColor: '#0f380f',
                      color: '#9cd84e',
                      border: '2px solid #9cd84e',
                      borderRadius: '0',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Personality */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    marginBottom: '6px',
                    color: '#9cd84e',
                  }}>
                    {t('characterCreation.personality')}
                  </label>
                  <input
                    type="text"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder={t('characterCreation.personalityPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      backgroundColor: '#0f380f',
                      color: '#9cd84e',
                      border: '2px solid #9cd84e',
                      borderRadius: '0',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Goals */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    marginBottom: '6px',
                    color: '#9cd84e',
                  }}>
                    {t('characterCreation.goals')}
                  </label>
                  <input
                    type="text"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder={t('characterCreation.goalsPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      backgroundColor: '#0f380f',
                      color: '#9cd84e',
                      border: '2px solid #9cd84e',
                      borderRadius: '0',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Fears */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    marginBottom: '6px',
                    color: '#9cd84e',
                  }}>
                    {t('characterCreation.fears')}
                  </label>
                  <input
                    type="text"
                    value={fears}
                    onChange={(e) => setFears(e.target.value)}
                    placeholder={t('characterCreation.fearsPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      backgroundColor: '#0f380f',
                      color: '#9cd84e',
                      border: '2px solid #9cd84e',
                      borderRadius: '0',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}>
            <Button onClick={onCancel} variant="secondary">
              {t('characterCreation.cancel')}
            </Button>
            <Button onClick={handleConfirm}>
              {t('characterCreation.createCharacter')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
