const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['s', 'h', 'd', 'c'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function dealHand(): { hand: string[]; joker: string } {
  const deck = RANKS.flatMap(rank => SUITS.map(suit => `${rank}.${suit}`));
  const shuffled = shuffle(deck);
  return { hand: shuffled.slice(0, 13), joker: shuffled[13] };
}
