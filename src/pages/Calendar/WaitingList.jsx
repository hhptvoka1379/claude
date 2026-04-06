import { useState } from 'react';
import { formatDuration } from '../../data/calendarUtils';
import './WaitingList.css';

export default function WaitingList({ events = [], subjects = [], onEventClick, onDropToWaitingList, onAddClick }) {
  const [dropActive, setDropActive] = useState(false);
  const [draggingId, setDraggingId] = useState(null);

  function handleDragOver(e) {
    e.preventDefault();
    setDropActive(true);
  }

  function handleDragLeave() {
    setDropActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDropActive(false);
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId) onDropToWaitingList?.(eventId);
  }

  function handlePillDragStart(e, event) {
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(event.id);
  }

  function handlePillDragEnd() {
    setDraggingId(null);
  }

  const containerClass = [
    'waiting-list',
    dropActive && 'waiting-list--drop-active',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClass}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="waiting-list__label">Waiting List</div>
      <div className="waiting-list__scroll">
        {events.map(event => {
          const subject = subjects.find(s => s.id === event.subject_id);
          const colour = subject?.colour || '#6b4f3a';
          const pillClass = [
            'waiting-list__pill',
            draggingId === event.id && 'waiting-list__pill--dragging',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={event.id}
              className={pillClass}
              style={{ borderLeftColor: colour }}
              draggable="true"
              onDragStart={e => handlePillDragStart(e, event)}
              onDragEnd={handlePillDragEnd}
              onClick={() => onEventClick?.(event)}
            >
              <span className="waiting-list__dot" style={{ background: colour }} />
              <span className="waiting-list__pill-title">{event.title}</span>
              {event.duration_minutes > 0 && (
                <span className="waiting-list__pill-duration">{formatDuration(event.duration_minutes)}</span>
              )}
            </div>
          );
        })}
        <button className="waiting-list__add-btn" onClick={() => onAddClick?.()}>
          + Add
        </button>
      </div>
    </div>
  );
}
