import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { parseCard, suitSymbol, isRed } from '../utils/cardFormat';

interface CardProps {
  cardStr: string;
  groupId: number;
  index: number;
}

export function Card({ cardStr, groupId, index }: CardProps) {
  const { rank, suit } = parseCard(cardStr);
  const sym = suitSymbol(suit);
  const red = isRed(cardStr);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: cardStr,
    data: { cardStr, sourceGroupId: groupId },
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: index * 38,
    zIndex: isDragging ? 999 : index + 1,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${red ? 'red' : 'black'}`}
      {...listeners}
      {...attributes}
    >
      <div className="card-corner top-left">
        <span className="rank">{rank}</span>
        <span className="suit-sm">{sym}</span>
      </div>
      <div className="suit-center">{sym}</div>
      <div className="card-corner bottom-right">
        <span className="rank">{rank}</span>
        <span className="suit-sm">{sym}</span>
      </div>
    </div>
  );
}
