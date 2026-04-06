import { useState, useMemo } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, getDay, isSameMonth, isToday, format,
} from 'date-fns';
import { eventsForDate, formatDuration } from '../../data/calendarUtils';
import './MonthView.css';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VISIBLE = 3;

export default function MonthView({
  year,
  month,
  events = [],
  subjects = [],
  examDate,
  onEventClick,
  onDateClick,
  onDropEvent,
  onContextMenu,
}) {
  const [dropTarget, setDropTarget] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const refDate = useMemo(() => new Date(year, month), [year, month]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(refDate);
    const monthEnd = endOfMonth(refDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [refDate]);

  function findSubject(subjectId) {
    return subjects.find(s => s.id === subjectId);
  }

  function handleCellClick(e, dateStr) {
    // Only trigger if clicking the cell itself, not a chip
    if (e.target.closest('.month-chip') || e.target.closest('.month-cell__more')) return;
    onDateClick?.(dateStr);
  }

  function handleDragOver(e) {
    e.preventDefault();
    const dateStr = e.currentTarget.dataset.date;
    if (dateStr) setDropTarget(dateStr);
  }

  function handleDragLeave() {
    setDropTarget(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDropTarget(null);
    const eventId = e.dataTransfer.getData('text/plain');
    const dateStr = e.currentTarget.dataset.date;
    if (eventId && dateStr) {
      onDropEvent?.(eventId, dateStr);
    }
  }

  function handleChipDragStart(e, event) {
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(event.id);
  }

  function handleChipDragEnd() {
    setDraggingId(null);
  }

  function handleChipClick(e, event) {
    e.stopPropagation();
    onEventClick?.(event);
  }

  function handleChipContextMenu(e, event) {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(e, event);
  }

  return (
    <div className="month-view">
      <div className="month-grid">
        {DAY_HEADERS.map(d => (
          <div key={d} className="month-grid__header">{d}</div>
        ))}

        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, refDate);
          const today = isToday(day);
          const dayOfWeek = getDay(day); // 0=Sun, 6=Sat
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isExamDay = examDate && dateStr === examDate;
          const isDrop = dropTarget === dateStr;

          const dayEvents = eventsForDate(events, dateStr);
          const totalMinutes = dayEvents.reduce((sum, ev) => sum + (ev.duration_minutes || 0), 0);
          const hoursLabel = totalMinutes > 0 ? `${Math.round(totalMinutes / 60 * 10) / 10}h` : null;

          const visible = dayEvents.slice(0, MAX_VISIBLE);
          const extra = dayEvents.length - MAX_VISIBLE;

          const cellClass = [
            'month-cell',
            !inMonth && 'month-cell--adjacent',
            isWeekend && 'month-cell--weekend',
            isExamDay && 'month-cell--exam',
            isDrop && 'month-cell--drop-active',
          ].filter(Boolean).join(' ');

          const dateClass = [
            'month-cell__date',
            today && 'month-cell__date--today',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={dateStr}
              className={cellClass}
              data-date={dateStr}
              onClick={e => handleCellClick(e, dateStr)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="month-cell__top">
                <span className={dateClass}>{format(day, 'd')}</span>
                {hoursLabel && <span className="month-cell__hours">{hoursLabel}</span>}
              </div>

              <div className="month-cell__events">
                {visible.map(event => {
                  const subject = findSubject(event.subject_id);
                  const colour = subject?.colour || '#6b4f3a';
                  const chipClass = [
                    'month-chip',
                    event.status === 'done' && 'month-chip--done',
                    draggingId === event.id && 'month-chip--dragging',
                  ].filter(Boolean).join(' ');

                  return (
                    <div
                      key={event.id}
                      className={chipClass}
                      draggable="true"
                      onDragStart={e => handleChipDragStart(e, event)}
                      onDragEnd={handleChipDragEnd}
                      onClick={e => handleChipClick(e, event)}
                      onContextMenu={e => handleChipContextMenu(e, event)}
                    >
                      <span className="month-chip__dot" style={{ background: colour }} />
                      <span className="month-chip__title">{event.title}</span>
                      {event.duration_minutes > 0 && (
                        <span className="month-chip__duration">
                          {formatDuration(event.duration_minutes)}
                        </span>
                      )}
                    </div>
                  );
                })}

                {extra > 0 && (
                  <button
                    className="month-cell__more"
                    title={dayEvents.map(e => e.title).join('\n')}
                    onClick={e => e.stopPropagation()}
                  >
                    +{extra} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
