const rules = [
  {
    title: 'Pure Sequence',
    body: '3 or more consecutive cards of the same suit — no joker allowed.',
    example: '5♠ 6♠ 7♠',
    color: '#4ade80',
  },
  {
    title: 'Impure Sequence',
    body: 'Same suit, consecutive, but a joker substitutes for a missing card.',
    example: '5♠ [Joker] 7♠',
    color: '#86efac',
  },
  {
    title: 'Set',
    body: 'Same rank, 3–4 cards of different suits. Joker can fill in.',
    example: '7♥ 7♠ 7♦',
    color: '#facc15',
  },
  {
    title: 'Valid Declaration',
    body: 'You need at least 1 pure sequence and at least 1 more sequence. All 13 cards must be grouped.',
    example: '',
    color: '#7dd3fc',
  },
  {
    title: 'Scoring',
    body: 'Ungrouped cards count against you. Face cards = 10 pts each, number cards = their value. Aim for 0.',
    example: '',
    color: '#c4b5fd',
  },
];

export function RulesPanel() {
  return (
    <div className="rules-panel">
      <p className="rules-heading">How to play</p>
      <div className="rules-grid">
        {rules.map(rule => (
          <div key={rule.title} className="rule-card">
            <span className="rule-title" style={{ color: rule.color }}>
              {rule.title}
            </span>
            <span className="rule-body">{rule.body}</span>
            {rule.example && <span className="rule-example">{rule.example}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
