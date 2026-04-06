import { useState } from 'react';
import { formatDuration } from '../../data/calendarUtils';
import './EventCard.css';

export default function EventCard({ event, subject, style, onClick, onContextMenu, compact }) {
  const [dragging, setDragging] = useState(false);

  const colour = subject?.colour || '#6b4f3a';
  const bgColour = colour + '40';
  const isDone = event.status === 'done';

  const classNames = [
    'event-card',
    !style && 'event-card--static',
    compact && 'event-card--compact',
    isDone && 'event-card--done',
    dragging && 'event-card--dragging',
  ].filter(Boolean).join(' ');

  const cardStyle = {
    ...(style || {}),
    background: bgColour,
    borderLeftColor: colour,
  };

  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
  }

  function handleDragEnd() {
    setDragging(false);
  }

  function handleClick(e) {
    e.stopPropagation();
    onClick?.(event);
  }

  function handleContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(e, event);
  }

  return (
    <div
      className={classNames}
      style={cardStyle}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="event-card__title">{event.title}</div>
      {!compact && event.duration_minutes > 0 && (
        <div className="event-card__duration">{formatDuration(event.duration_minutes)}</div>
      )}
    </div>
  );
}
