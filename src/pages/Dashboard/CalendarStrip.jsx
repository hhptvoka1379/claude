import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { startOfWeek, addDays, format } from 'date-fns';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import { createCalendarEvent } from '../../data/schema';
import { expandRecurrences } from '../../data/calendarUtils';
import Card from '../../components/ui/Card';
import WeekView from '../Calendar/WeekView';
import EventModal from '../Calendar/EventModal';
import './CalendarStrip.css';

export default function CalendarStrip() {
  const { subjects, addXP } = useApp();
  const { items: rawEvents, add, update, remove } = useCollection('calendar_events', []);

  const [modalState, setModalState] = useState({ isOpen: false, event: null });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const events = useMemo(() =>
    expandRecurrences(rawEvents, weekStart, weekEnd),
    [rawEvents, weekStart, weekEnd]
  );

  const handleEventClick = useCallback((event) => {
    const editEvent = event._isGenerated
      ? rawEvents.find(e => e.id === event._parentId) || event
      : event;
    setModalState({ isOpen: true, event: editEvent });
  }, [rawEvents]);

  const handleEventUpdate = useCallback((eventId, patch) => {
    // Resolve generated events to their parent
    const resolvedId = eventId.includes('__') ? eventId.split('__')[0] : eventId;
    update(resolvedId, patch);
  }, [update]);

  const handleCreateEvent = useCallback((date, time) => {
    const event = createCalendarEvent({
      date: format(date, 'yyyy-MM-dd'),
      time_start: time || null,
      _isNew: true,
    });
    setModalState({ isOpen: true, event });
  }, []);

  const handleSave = useCallback((eventData) => {
    const existing = rawEvents.find(e => e.id === eventData.id);
    if (existing) {
      const wasPending = existing.status !== 'done';
      update(eventData.id, eventData);
      if (wasPending && eventData.status === 'done') {
        addXP(10);
        toast.success('Event completed! +10 XP');
      } else {
        toast.success('Event updated');
      }
    } else {
      const newEvent = createCalendarEvent(eventData);
      add(newEvent);
      toast.success('Event created');
    }
    setModalState({ isOpen: false, event: null });
  }, [rawEvents, add, update, addXP]);

  const handleDelete = useCallback((eventId) => {
    remove(eventId);
    toast.success('Event deleted');
    setModalState({ isOpen: false, event: null });
  }, [remove]);

  return (
    <Card className="calendar-strip">
      <div className="calendar-strip__header">
        <span className="calendar-strip__title">This Week</span>
        <Link to="/calendar" className="calendar-strip__link">
          View Full Calendar &rarr;
        </Link>
      </div>
      <WeekView
        startDate={weekStart}
        days={7}
        events={events}
        subjects={subjects}
        pxPerHour={48}
        startHour={8}
        endHour={22}
        onEventClick={handleEventClick}
        onEventUpdate={handleEventUpdate}
        onCreateEvent={handleCreateEvent}
        compact
      />
      <EventModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, event: null })}
        event={modalState.event}
        onSave={handleSave}
        onDelete={handleDelete}
        subjects={subjects}
      />
    </Card>
  );
}
