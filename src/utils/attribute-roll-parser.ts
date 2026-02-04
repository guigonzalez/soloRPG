/**
 * Parse AI message content to detect attribute roll suggestions
 * Patterns:
 * - "Role **Força (STR)**" or "Roll **Strength (STR)**"
 * - "(Dificuldade: 15)" or "(DC: 15)" or "DC 15"
 */

export interface AttributeRollSuggestion {
  fullMatch: string;
  attributeName: string;
  attributeAbbr: string;
  dc?: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Extract DC from surrounding text
 */
function extractDC(text: string, matchEnd: number): number | undefined {
  // Look ahead up to 100 characters for DC mention
  const lookAhead = text.slice(matchEnd, matchEnd + 100);

  // Patterns: (Dificuldade: 47), (DC: 15), DC 15, (CD: 20)
  const dcPatterns = [
    /\((?:Dificuldade|DC|CD|Difficulty):\s*(\d+)\)/i,
    /(?:DC|CD|Dificuldade|Difficulty)\s+(\d+)/i,
  ];

  for (const pattern of dcPatterns) {
    const match = lookAhead.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return undefined;
}

/**
 * Parse text for attribute roll suggestions
 * Returns array of suggestions with their positions
 */
export function parseAttributeRolls(text: string): AttributeRollSuggestion[] {
  const suggestions: AttributeRollSuggestion[] = [];

  // Pattern: Role/Roll **AttributeName (ABBR)**
  // Matches: Role **Força (STR)**, Roll **Strength (STR)**, Roule **Dextérité (DEX)**
  const pattern = /\*\*([^(*]+?)\s*\(([A-Z]{2,4})\)\*\*/gi;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const fullMatch = match[0];
    const attributeName = match[1].trim();
    const attributeAbbr = match[2].trim();
    const startIndex = match.index;
    const endIndex = match.index + fullMatch.length;

    // Look for DC after the match
    const dc = extractDC(text, endIndex);

    suggestions.push({
      fullMatch,
      attributeName,
      attributeAbbr,
      dc,
      startIndex,
      endIndex,
    });
  }

  return suggestions;
}

/**
 * Split text into segments with attribute roll suggestions marked
 */
export interface TextSegment {
  type: 'text' | 'attribute-roll';
  content: string;
  suggestion?: AttributeRollSuggestion;
}

export function splitTextWithAttributeRolls(text: string): TextSegment[] {
  const suggestions = parseAttributeRolls(text);

  if (suggestions.length === 0) {
    return [{ type: 'text', content: text }];
  }

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const suggestion of suggestions) {
    // Add text before this suggestion
    if (suggestion.startIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, suggestion.startIndex),
      });
    }

    // Add the attribute roll suggestion
    segments.push({
      type: 'attribute-roll',
      content: suggestion.fullMatch,
      suggestion,
    });

    lastIndex = suggestion.endIndex;
  }

  // Add remaining text after last suggestion
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}
