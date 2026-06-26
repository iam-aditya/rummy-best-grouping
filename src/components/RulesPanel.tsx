const SUIT_SYM: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };

function ExCard({ rank, suit }: { rank: string; suit: string }) {
  const sym = SUIT_SYM[suit] ?? suit;
  const red = suit === 'h' || suit === 'd';
  return (
    <div className={`ex-card ${red ? 'red' : 'black'}`}>
      <span className="ex-rank">{rank}</span>
      <span className="ex-suit">{sym}</span>
    </div>
  );
}

function ExJoker() {
  return (
    <div className="ex-card ex-joker">
      <span className="ex-rank" style={{ fontSize: 10, letterSpacing: 1 }}>WILD</span>
      <span className="ex-suit" style={{ fontSize: 16 }}>★</span>
    </div>
  );
}

export function RulesPanel() {
  return (
    <div className="rules-panel">
      <p className="rules-heading">How to play</p>

      <div className="rules-goal">
        <strong>Objective:</strong> Arrange your 13 cards into valid groups to minimize your total
        points. Cards inside a valid group score <strong>zero</strong>. Cards left in your hand
        score their face value — lowest wins, zero wins outright.
      </div>

      <div className="rules-grid">
        <div className="rule-card">
          <span className="rule-title" style={{ color: '#4ade80' }}>
            Pure Sequence
          </span>
          <div className="ex-cards-row">
            <ExCard rank="5" suit="s" />
            <ExCard rank="6" suit="s" />
            <ExCard rank="7" suit="s" />
          </div>
          <span className="rule-body">
            3 or more consecutive cards of the same suit. No joker allowed.
          </span>
        </div>

        <div className="rule-card">
          <span className="rule-title" style={{ color: '#86efac' }}>
            Impure Sequence
          </span>
          <div className="ex-cards-row">
            <ExCard rank="4" suit="h" />
            <ExJoker />
            <ExCard rank="6" suit="h" />
          </div>
          <span className="rule-body">
            3 or more consecutive, same suit. Joker substitutes one missing card.
          </span>
        </div>

        <div className="rule-card">
          <span className="rule-title" style={{ color: '#facc15' }}>
            Set
          </span>
          <div className="ex-cards-row">
            <ExCard rank="9" suit="s" />
            <ExCard rank="9" suit="h" />
            <ExCard rank="9" suit="d" />
          </div>
          <span className="rule-body">
            3 or 4 cards of the same rank, each from a different suit. Joker can fill one spot.
          </span>
        </div>

        <div className="rule-card">
          <span className="rule-title" style={{ color: '#c4b5fd' }}>
            Point values
          </span>
          <span className="rule-body">
            A · J · Q · K = <strong>10 pts</strong>
            <br />
            2 – 10 = face value
            <br />
            Joker = <strong>0 pts always</strong>
            <br />
            Cards in valid groups count 0. Score capped at 80.
          </span>
        </div>
      </div>

      <div className="rules-draw-section">
        <p className="rules-draw-title">Drawing & discarding</p>
        <p className="rules-draw-body">
          Click the deck to draw a card — you'll temporarily hold 14 cards. Then click{' '}
          <strong>×</strong> on any card to discard it and return to 13. You must complete
          one draw-and-discard before you can submit. Repeat as many times as you like
          to improve your hand.
        </p>
      </div>

      <div className="rules-joker-section">
        <p className="rules-joker-title">Joker rules</p>
        <div className="rules-joker-body">
          <div className="ex-cards-row" style={{ alignSelf: 'flex-start' }}>
            <ExJoker />
          </div>
          <ul className="rules-joker-list">
            <li>Each joker can be used in a different group — only one joker per group</li>
            <li>A joker replaces any one missing card in a sequence or set</li>
            <li>Jokers always score 0 points, whether used or not</li>
            <li>Cards not in any valid group are your deadwood and add to your score</li>
          </ul>
        </div>
      </div>

      <div className="rules-scoring-section">
        <p className="rules-scoring-title">Scoring</p>
        <ul className="rules-scoring-list">
          <li>
            <span className="rules-scoring-label">Valid declaration</span>
            You have at least <strong>1 pure sequence</strong> and at least{' '}
            <strong>2 sequences total</strong>. Only ungrouped cards count — everything
            else scores zero.
          </li>
          <li>
            <span className="rules-scoring-label">Flat 80</span>
            If you don't have both a pure sequence <em>and</em> a second sequence, your
            score is a flat <strong>80 pts</strong> no matter how the rest is grouped.
            A set alone doesn't save you — you need two sequences.
          </li>
          <li>
            <span className="rules-scoring-label">Score cap</span>
            The maximum score is <strong>80 pts</strong>. Even if your ungrouped cards
            add up to more, you won't go above 80.
          </li>
        </ul>
      </div>
    </div>
  );
}
