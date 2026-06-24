export interface Group {
  id: number;
  cards: string[];
}

const SUIT_SYMBOLS: Record<string, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
  j: '★',
};

export function toGpFormat(groups: Group[]): string[] {
  return groups.flatMap(group => group.cards.map(card => `${card}.${group.id}`));
}

export function parseCard(cardStr: string): { rank: string; suit: string } {
  const dot = cardStr.indexOf('.');
  return { rank: cardStr.slice(0, dot), suit: cardStr.slice(dot + 1) };
}

export function suitSymbol(suit: string): string {
  return SUIT_SYMBOLS[suit] ?? suit;
}

export function isRed(cardStr: string): boolean {
  const { suit } = parseCard(cardStr);
  return suit === 'h' || suit === 'd';
}

export function cardDisplay(cardStr: string): string {
  const { rank, suit } = parseCard(cardStr);
  return `${rank}${suitSymbol(suit)}`;
}
