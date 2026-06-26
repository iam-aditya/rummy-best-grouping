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
      <div className="card-corner top-left">
        <span className="rank">{rank}</span>
        <span className="suit-sm">{sym}</span>
      </div>
      <div className="suit-center">{sym}</div>
      <div className="card-corner bottom-right">
        <span className="rank">{rank}</span>
        <span className="suit-sm">{sym}</span>
      </div>
      <div className="joker-badge">WILD</div>
    </div>
  );
}

type Phase = 'must-draw' | 'must-discard' | 'can-submit';

function newGame() {
  const { hand, joker, remainingDeck } = dealHand();
  return {
    joker,
    groups: [{ id: 1, cards: hand }] as Group[],
    nextId: 2,
    deckCards: remainingDeck,
    phase: 'must-draw' as Phase,
  };
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

  function drawCard() {
    if (game.phase === 'must-discard' || game.deckCards.length === 0) return;
    const [top, ...rest] = game.deckCards;
    setGame(prev => ({
      ...prev,
      deckCards: rest,
      phase: 'must-discard',
      groups: prev.groups.map((g, i) => i === 0 ? { ...g, cards: [...g.cards, top] } : g),
    }));
  }

  function discardCard(cardStr: string, groupId: number) {
    if (game.phase !== 'must-discard') return;
    setGame(prev => ({
      ...prev,
      phase: 'can-submit',
      groups: prev.groups.map(g =>
        g.id === groupId ? { ...g, cards: g.cards.filter(c => c !== cardStr) } : g
      ),
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
        <div className="header-left">
          <div className="deck-area">
            <span className="deck-label">Deck</span>
            <button
              className="deck-pile"
              onClick={drawCard}
              disabled={game.phase === 'must-discard' || game.deckCards.length === 0}
              title="Draw a card"
            >
              <div className="deck-card-face">
                <span className="deck-count">{game.deckCards.length}</span>
                <span className="deck-cards-left">cards left</span>
              </div>
            </button>
            <span className="deck-hint">
              {game.phase === 'must-draw' && 'Draw to start'}
              {game.phase === 'must-discard' && 'Discard one'}
              {game.phase === 'can-submit' && 'Draw again?'}
            </span>
          </div>

          <div className="joker-area">
            <span className="joker-label">Joker</span>
            <JokerCard cardStr={game.joker} />
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {game.phase === 'must-discard' && (
          <div className="discard-banner">
            You drew a card — click × on any card to discard it
          </div>
        )}

        <div className="groups-area">
          {game.groups.map((group, i) => (
            <CardGroup
              key={group.id}
              group={group}
              index={i}
              onDelete={() => deleteGroup(group.id)}
              canDelete={game.groups.length > 1}
              discardMode={game.phase === 'must-discard'}
              onDiscard={(cardStr) => discardCard(cardStr, group.id)}
            />
          ))}
          <button className="btn-add-group" onClick={addGroup}>
            <span className="add-icon">＋</span>
            <span>New group</span>
          </button>
        </div>

        <div className="submit-row">
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={loading || game.phase !== 'can-submit'}
          >
            {loading ? 'Checking…' :
             game.phase === 'must-draw' ? 'Draw a card first →' :
             game.phase === 'must-discard' ? 'Discard a card first' :
             'Submit grouping →'}
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
          joker={game.joker}
          onPlayAgain={playAgain}
        />
      )}
    </div>
  );
}
