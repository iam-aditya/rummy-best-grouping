import { useDroppable } from '@dnd-kit/core';
import { Card } from './Card';
import type { Group } from '../utils/cardFormat';

interface CardGroupProps {
  group: Group;
  index: number;
  onDelete: () => void;
  canDelete: boolean;
  discardMode?: boolean;
  onDiscard?: (cardStr: string) => void;
}

export function CardGroup({ group, index, onDelete, canDelete, discardMode, onDiscard }: CardGroupProps) {
  const { setNodeRef, isOver } = useDroppable({ id: group.id });
  const n = group.cards.length;
  const stackWidth = Math.max(110, 38 * (n - 1) + 72);

  return (
    <div className={`card-group${isOver ? ' drag-over' : ''}`}>
      <div className="group-header">
        <span className="group-label">Group {index + 1}</span>
        {canDelete && n === 0 && (
          <button className="btn-delete-group" onClick={onDelete} title="Remove group">
            ×
          </button>
        )}
      </div>
      <div ref={setNodeRef} className="card-stack" style={{ width: stackWidth, height: 110 }}>
        {n === 0 && <div className="empty-hint">drop here</div>}
        {group.cards.map((cardStr, i) => (
          <Card
            key={cardStr}
            cardStr={cardStr}
            groupId={group.id}
            index={i}
            discardMode={discardMode}
            onDiscard={discardMode ? () => onDiscard?.(cardStr) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
