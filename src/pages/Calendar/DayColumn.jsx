import { useState } from 'react';
import { format, isToday, parseISO, isBefore, startOfDay } from 'date-fns';
import { detectOverlaps, timeToPixels, durationToPixels, pixelsToTime } from '../../data/calendarUtils';
import EventCard from './EventCard';
import './DayColumn.css';

export default function DayColumn({
  date,
  events = [],
  startHour = 8,
  endHour = 22,
  pxPerHour = 48,
  onEventClick,
  onEmptyCellClick,
  onDropEvent,
  onContextMenu,
  compact,
  subjects = [],
}) {
  const [dropActive, setDropActive] = useState(false);

  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = isToday(dateObj);
  const past = isBefore(dateObj, startOfDay(new Date())) && !today;
  const bodyHeight = (endHour - startHour) * pxPerHour;

  const scheduledEvents = events.filter(e => e.time_start != null);
  const annotated = detectOverlaps(scheduledEvents);
  // Only use annotated scheduled events (those with _column)
  const scheduledAnnotated = annotated.filter(e => e._column !== undefined);

  const headerClass = [
    'day-col__header',
    today && 'day-col__header--today',
    past && 'day-col__header--past',
  ].filter(Boolean).join(' ');

  const colClass = [
    'day-col',
    compact && 'day-col--compact',
  ].filter(Boolean).join(' ');

  function handleBodyClick(e) {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const time = pixelsToTime(offsetY, pxPerHour, startHour);
    onEmptyCellClick?.(dateObj, time);
  }

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
    if (!eventId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const newTime = pixelsToTime(offsetY, pxPerHour, startHour);
    onDropEvent?.(eventId, dateObj, newTime);
  }

  return (
    <div className={colClass} data-date={dateStr}>
      <div className={headerClass}>
        {format(dateObj, 'EEE')} {format(dateObj, 'd')}
      </div>
      <div
        className={`day-col__body${dropActive ? ' drop-zone--active' : ''}`}
        style={{ height: bodyHeight, '--px-per-hour': `${pxPerHour}px` }}
        onClick={handleBodyClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {scheduledAnnotated.map(event => {
          const top = timeToPixels(event.time_start, pxPerHour, startHour);
          const height = durationToPixels(event.duration_minutes || 60, pxPerHour);
          const left = `${(event._column / event._totalColumns) * 100}%`;
          const width = `${(1 / event._totalColumns) * 100}%`;
          const subject = subjects.find(s => s.id === event.subject_id);

          return (
            <EventCard
              key={event.id}
              event={event}
              subject={subject}
              compact={compact}
              style={{ top, height, left, width }}
              onClick={onEventClick}
              onContextMenu={onContextMenu}
            />
          );
        })}
      </div>
    </div>
  );
}
