import { useDroppable } from '@dnd-kit/core';
import { Card } from './Card';
import type { Group } from '../utils/cardFormat';

interface CardGroupProps {
  group: Group;
  index: number;
  onDelete: () => void;
  canDelete: boolean;
}

export function CardGroup({ group, index, onDelete, canDelete }: CardGroupProps) {
  const { setNodeRef, isOver } = useDroppable({ id: group.id });
  const stackWidth = Math.max(110, 38 * (group.cards.length - 1) + 72);

  return (
    <div className={`card-group${isOver ? ' drag-over' : ''}`}>
      <div className="group-header">
        <span className="group-label">Group {index + 1}</span>
        {canDelete && group.cards.length === 0 && (
          <button className="btn-delete-group" onClick={onDelete} title="Remove group">
            ×
          </button>
        )}
      </div>
      <div
        ref={setNodeRef}
        className="card-stack"
        style={{ width: stackWidth, height: 110 }}
      >
        {group.cards.length === 0 && (
          <div className="empty-hint">drop here</div>
        )}
        {group.cards.map((cardStr, i) => (
          <Card key={cardStr} cardStr={cardStr} groupId={group.id} index={i} />
        ))}
      </div>
    </div>
  );
}
