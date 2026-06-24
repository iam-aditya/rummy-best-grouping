import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CardGroup } from './components/CardGroup';
import { RulesPanel } from './components/RulesPanel';
import { ResultView } from './components/ResultView';
import { dealHand } from './utils/deck';
import { toGpFormat, parseCard, suitSymbol, isRed } from './utils/cardFormat';
import type { Group } from './utils/cardFormat';
import './App.css';

interface ApiResult {
  userResult: {
    isValid: boolean;
    score: number;
    names: string[];
    groupIdToTypeMap: Record<string, string>;
  };
  bestResult: {
    isValid: boolean;
    score: number;
    names: string[];
    groupIdToTypeMap: Record<string, string>;
  };
}

function JokerCard({ cardStr }: { cardStr: string }) {
  const { rank, suit } = parseCard(cardStr);
  const sym = suitSymbol(suit);
  const red = isRed(cardStr);
  return (
    <div className={`joker-card-display ${red ? 'red' : 'black'}`}>
      <div className="joker-card-corner">
        <span>{rank}</span>
        <span>{sym}</span>
      </div>
      <div className="joker-card-sym">{sym}</div>
    </div>
  );
}

function newGame() {
  const { hand, joker } = dealHand();
  return { hand, joker, groups: [{ id: 1, cards: hand }] as Group[], nextId: 2 };
}

export default function App() {
  const [game, setGame] = useState(newGame);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveCard(e.active.data.current?.cardStr ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveCard(null);
    const { over, active } = e;
    if (!over) return;

    const { cardStr, sourceGroupId } = active.data.current as {
      cardStr: string;
      sourceGroupId: number;
    };
    const targetGroupId = over.id as number;
    if (sourceGroupId === targetGroupId) return;

    setGame(prev => ({
      ...prev,
      groups: prev.groups.map(g => {
        if (g.id === sourceGroupId) return { ...g, cards: g.cards.filter(c => c !== cardStr) };
        if (g.id === targetGroupId) return { ...g, cards: [...g.cards, cardStr] };
        return g;
      }),
    }));
  }

  function addGroup() {
    setGame(prev => ({
      ...prev,
      groups: [...prev.groups, { id: prev.nextId, cards: [] }],
      nextId: prev.nextId + 1,
    }));
  }

  function deleteGroup(id: number) {
    setGame(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== id),
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: toGpFormat(game.groups), joker: game.joker }),
      });
      const data: ApiResult = await res.json();
      setResult(data);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function playAgain() {
    setResult(null);
    setGame(newGame());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeSym = activeCard ? suitSymbol(parseCard(activeCard).suit) : '';
  const activeRank = activeCard ? parseCard(activeCard).rank : '';
  const activeRed = activeCard ? isRed(activeCard) : false;

  return (
    <div className="app">
      <div className="header">
        <div className="joker-area">
          <span className="joker-label">Wild joker</span>
          <JokerCard cardStr={game.joker} />
          <span className="joker-hint">
            Any {parseCard(game.joker).rank} in your hand acts as a joker
          </span>
        </div>
        <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Checking…' : 'Submit grouping'}
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="groups-area">
          {game.groups.map((group, i) => (
            <CardGroup
              key={group.id}
              group={group}
              index={i}
              onDelete={() => deleteGroup(group.id)}
              canDelete={game.groups.length > 1}
            />
          ))}
          <button className="btn-add-group" onClick={addGroup}>
            <span className="add-icon">＋</span>
            <span>New group</span>
          </button>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard && (
            <div className={`card drag-clone ${activeRed ? 'red' : 'black'}`}>
              <div className="card-corner top-left">
                <span className="rank">{activeRank}</span>
                <span className="suit-sm">{activeSym}</span>
              </div>
              <div className="suit-center">{activeSym}</div>
              <div className="card-corner bottom-right">
                <span className="rank">{activeRank}</span>
                <span className="suit-sm">{activeSym}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <RulesPanel />

      {result && (
        <ResultView
          userResult={result.userResult}
          bestResult={result.bestResult}
          onPlayAgain={playAgain}
        />
      )}
    </div>
  );
}
