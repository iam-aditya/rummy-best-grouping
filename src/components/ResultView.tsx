import { parseCard, suitSymbol, isRed } from '../utils/cardFormat';

interface FormationResult {
  isValid: boolean;
  score: number;
  names: string[];
  groupIdToTypeMap: Record<string, string>;
}

interface ResultViewProps {
  userResult: FormationResult;
  bestResult: FormationResult;
  onPlayAgain: () => void;
}

interface ParsedGroup {
  type: string;
  cards: Array<{ display: string; usedAsJoker: boolean }>;
}

const TYPE_LABEL: Record<string, string> = {
  seq: 'Pure Sequence ✓',
  impSeq: 'Impure Sequence ✓',
  set: 'Set ✓',
  inv: 'Invalid ✗',
};

const TYPE_DESC: Record<string, string> = {
  seq: 'Consecutive same-suit cards — no joker needed',
  impSeq: 'Joker fills the gap in the sequence',
  set: 'Same rank across different suits',
  inv: "Doesn't form any valid combination",
};

const TYPE_CLASS: Record<string, string> = {
  seq: 'type-seq',
  impSeq: 'type-impseq',
  set: 'type-set',
  inv: 'type-inv',
};

function parseNames(
  names: string[],
  typeMap: Record<string, string>
): { groups: Record<string, ParsedGroup>; ungrouped: string[] } {
  const groups: Record<string, ParsedGroup> = {};
  const ungrouped: string[] = [];

  for (const name of names) {
    const parts = name.split('.');
    const rank = parts[0];
    const suit = parts[1];
    const groupId = parts[2];
    const usedAs = parts[3];

    const display = `${rank}.${suit}`;

    if (groupId) {
      if (!groups[groupId]) {
        groups[groupId] = { type: typeMap[groupId] ?? 'inv', cards: [] };
      }
      groups[groupId].cards.push({ display, usedAsJoker: usedAs === 'jk' });
    } else {
      ungrouped.push(display);
    }
  }

  return { groups, ungrouped };
}

function ResultCard({ cardStr, isJoker }: { cardStr: string; isJoker: boolean }) {
  const { rank, suit } = parseCard(cardStr);
  const sym = suitSymbol(suit);
  const red = isRed(cardStr);
  return (
    <span className={`result-card ${isJoker ? 'result-card-joker' : red ? 'result-card-red' : 'result-card-black'}`}>
      {rank}{sym}
      {isJoker && <span className="joker-tag">J</span>}
    </span>
  );
}

function GroupList({
  parsed,
  label,
}: {
  parsed: { groups: Record<string, ParsedGroup>; ungrouped: string[] };
  label: string;
}) {
  return (
    <div className="result-group-list">
      {Object.entries(parsed.groups).map(([id, g], i) => (
        <div key={id} className="result-group">
          <div className="result-group-meta">
            <span className="result-group-num">{label} {i + 1}</span>
            <span className={`result-group-type ${TYPE_CLASS[g.type] ?? ''}`}>
              {TYPE_LABEL[g.type] ?? g.type}
            </span>
          </div>
          <div className="result-cards-row">
            {g.cards.map((c, j) => (
              <ResultCard key={j} cardStr={c.display} isJoker={c.usedAsJoker} />
            ))}
          </div>
          <p className="result-group-desc">{TYPE_DESC[g.type]}</p>
        </div>
      ))}
      {parsed.ungrouped.length > 0 && (
        <div className="result-group">
          <div className="result-group-meta">
            <span className="result-group-num">Ungrouped</span>
            <span className={`result-group-type ${TYPE_CLASS['inv']}`}>
              Not part of any group ✗
            </span>
          </div>
          <div className="result-cards-row">
            {parsed.ungrouped.map((c, j) => (
              <ResultCard key={j} cardStr={c} isJoker={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Confetti() {
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 3 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 7 + Math.random() * 7,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="confetti-wrap" aria-hidden>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function AppreciationBanner({
  userScore,
  bestScore,
  isValid,
}: {
  userScore: number;
  bestScore: number;
  isValid: boolean;
}) {
  if (isValid && userScore === 0) {
    return (
      <div className="appreciation perfect">
        <div className="appr-icon">🎉</div>
        <div className="appr-title">Perfect declaration!</div>
        <div className="appr-sub">You won with a valid hand. Score: 0</div>
      </div>
    );
  }
  if (userScore === bestScore) {
    return (
      <div className="appreciation optimal">
        <div className="appr-icon">⭐</div>
        <div className="appr-title">Optimal grouping</div>
        <div className="appr-sub">You found the best possible arrangement for this hand.</div>
      </div>
    );
  }
  if (userScore <= bestScore + 10) {
    return (
      <div className="appreciation good">
        <div className="appr-icon">👍</div>
        <div className="appr-title">Good grouping!</div>
        <div className="appr-sub">Just slightly off the best — see below how to improve.</div>
      </div>
    );
  }
  return (
    <div className="appreciation improve">
      <div className="appr-icon">💡</div>
      <div className="appr-title">Here's how you can do better</div>
      <div className="appr-sub">
        Your score: {userScore} pts &nbsp;·&nbsp; Best possible: {bestScore} pts
      </div>
    </div>
  );
}

export function ResultView({ userResult, bestResult, onPlayAgain }: ResultViewProps) {
  const userParsed = parseNames(userResult.names, userResult.groupIdToTypeMap);
  const bestParsed = parseNames(bestResult.names, bestResult.groupIdToTypeMap);
  const showConfetti = userResult.isValid && userResult.score === 0;

  return (
    <div className="result-section">
      {showConfetti && <Confetti />}

      <AppreciationBanner
        userScore={userResult.score}
        bestScore={bestResult.score}
        isValid={userResult.isValid}
      />

      <div className="result-block">
        <div className="result-block-header">
          <span className="result-block-title">Your grouping</span>
          <span className={`result-score ${userResult.isValid ? 'score-valid' : 'score-invalid'}`}>
            {userResult.isValid ? '✓ Valid — ' : '✗ Score: '}
            {userResult.score} pts
          </span>
        </div>
        <GroupList parsed={userParsed} label="Your group" />
      </div>

      <div className="result-block">
        <div className="result-block-header">
          <span className="result-block-title">Best possible grouping</span>
          <span className={`result-score ${bestResult.isValid ? 'score-valid' : 'score-invalid'}`}>
            {bestResult.isValid ? '✓ Valid — ' : 'Score: '}
            {bestResult.score} pts
          </span>
        </div>
        <GroupList parsed={bestParsed} label="Group" />
      </div>

      <div className="play-again-row">
        <button className="btn-play-again" onClick={onPlayAgain}>
          Deal new hand
        </button>
      </div>
    </div>
  );
}
