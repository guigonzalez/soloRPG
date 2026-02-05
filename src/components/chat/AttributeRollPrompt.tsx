import type { Character } from '../../types/models';
import { getSheetPreset } from '../../services/game/sheet-presets';

interface AttributeRollPromptProps {
  attributeName: string;
  attributeAbbr: string;
  dc?: number;
  character: Character | null;
  campaignSystem: string;
  onRoll: (rollNotation: string, dc?: number) => void;
  disabled?: boolean;
}

/**
 * Inline button for rolling an attribute check
 * Renders as a clickable chip that shows the attribute and modifier
 */
export function AttributeRollPrompt({
  attributeName,
  attributeAbbr,
  dc,
  character,
  campaignSystem,
  onRoll,
  disabled,
}: AttributeRollPromptProps) {
  if (!character) return <span>**{attributeName} ({attributeAbbr})**</span>;

  const preset = getSheetPreset(campaignSystem);

  // Find the attribute definition
  const attrDef = preset.attributes.find(
    a => a.name.toLowerCase() === attributeAbbr.toLowerCase() ||
         a.displayName.toLowerCase() === attributeAbbr.toLowerCase()
  );

  if (!attrDef) {
    return <span>**{attributeName} ({attributeAbbr})**</span>;
  }

  const value = character.attributes[attrDef.name] || 0;
  const modifier = preset.modifierCalculation?.(value);
  const modifierStr = modifier !== undefined && modifier !== 0
    ? (modifier > 0 ? `+${modifier}` : `${modifier}`)
    : '';

  const handleClick = () => {
    if (disabled) return;

    // Roll d20 + modifier for most systems (D&D, Pathfinder, etc.)
    // For percentage systems (Call of Cthulhu), roll d100
    const rollNotation = preset.modifierCalculation
      ? `1d20${modifierStr}`
      : '1d100';

    onRoll(rollNotation, dc);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        margin: '0 2px',
        fontSize: '13px',
        fontWeight: 'bold',
        color: 'var(--color-accent)',
        backgroundColor: 'var(--color-bg-primary)',
        border: '2px solid var(--color-accent)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        fontFamily: 'var(--font-family)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--color-accent)';
          e.currentTarget.style.color = 'var(--color-bg-primary)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
        e.currentTarget.style.color = 'var(--color-accent)';
      }}
      title={`Roll ${attrDef.displayName} check (${value}${modifierStr})${dc ? ` vs DC ${dc}` : ''}`}
    >
      <span>{attrDef.displayName}</span>
      {modifierStr && <span>({modifierStr})</span>}
      {dc && <span style={{ opacity: 0.7 }}>DC {dc}</span>}
    </button>
  );
}
