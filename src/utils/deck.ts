const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['s', 'h', 'd', 'c'];

const RANK_VALUE: Record<string, number> = {
  A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
  '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hasPureSequence(hand: string[]): boolean {
  for (const suit of SUITS) {
    const ranks = hand
      .filter(c => c.slice(c.indexOf('.') + 1) === suit)
      .map(c => c.slice(0, c.indexOf('.')));

    if (ranks.length < 3) continue;

    const vals = [...new Set(ranks.map(r => RANK_VALUE[r]))].sort((a, b) => a - b);

    let streak = 1;
    for (let i = 1; i < vals.length; i++) {
      if (vals[i] === vals[i - 1] + 1) {
        if (++streak >= 3) return true;
      } else {
        streak = 1;
      }
    }

    if (ranks.includes('A') && ranks.includes('K') && ranks.includes('Q')) return true;
  }
  return false;
}

export function dealHand(): { hand: string[]; joker: string; remainingDeck: string[] } {
  const deck = RANKS.flatMap(rank => SUITS.map(suit => `${rank}.${suit}`));
  let shuffled: string[];
  do {
    shuffled = shuffle(deck);
  } while (!hasPureSequence(shuffled.slice(0, 13)));
  return { hand: shuffled.slice(0, 13), joker: shuffled[13], remainingDeck: shuffled.slice(14) };
}
