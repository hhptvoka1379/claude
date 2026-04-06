import { eachDayOfInterval, addDays, format, parseISO } from 'date-fns';
import { eventsForDate } from '../../data/calendarUtils';
import DayColumn from './DayColumn';
import WaitingList from './WaitingList';
import './WeekView.css';

export default function WeekView({
  startDate,
  days = 7,
  events = [],
  subjects = [],
  pxPerHour = 48,
  startHour = 8,
  endHour = 22,
  onEventClick,
  onEventUpdate,
  onCreateEvent,
  onContextMenu,
  compact,
}) {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const interval = eachDayOfInterval({ start, end: addDays(start, days - 1) });
  const bodyHeight = (endHour - startHour) * pxPerHour;

  const unscheduled = events.filter(e => !e.time_start);

  function handleDropEvent(eventId, date, newTime) {
    onEventUpdate?.(eventId, { date: format(date, 'yyyy-MM-dd'), time_start: newTime });
  }

  function handleDropToWaitingList(eventId) {
    onEventUpdate?.(eventId, { time_start: null });
  }

  // Build time labels
  const timeLabels = [];
  for (let h = startHour; h <= endHour; h++) {
    timeLabels.push({
      label: `${String(h).padStart(2, '0')}:00`,
      top: (h - startHour) * pxPerHour,
    });
  }

  return (
    <div className="week-view">
      <div className="week-view__grid">
        <div className="week-view__gutter">
          <div className="week-view__gutter-header" />
          <div className="week-view__gutter-body" style={{ height: bodyHeight }}>
            {timeLabels.map(({ label, top }) => (
              <span key={label} className="week-view__time-label" style={{ top }}>
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="week-view__columns">
          {interval.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayEvents = eventsForDate(events, dateStr);

            return (
              <DayColumn
                key={dateStr}
                date={date}
                events={dayEvents}
                startHour={startHour}
                endHour={endHour}
                pxPerHour={pxPerHour}
                onEventClick={onEventClick}
                onEmptyCellClick={onCreateEvent}
                onDropEvent={handleDropEvent}
                onContextMenu={onContextMenu}
                compact={compact}
                subjects={subjects}
              />
            );
          })}
        </div>
      </div>
      <WaitingList
        events={unscheduled}
        subjects={subjects}
        onEventClick={onEventClick}
        onDropToWaitingList={handleDropToWaitingList}
        onAddClick={() => onCreateEvent?.()}
      />
    </div>
  );
}
