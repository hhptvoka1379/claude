import { useState, useMemo, useCallback } from 'react';
import {
  format, startOfMonth, endOfMonth, addMonths, subMonths,
  addWeeks, subWeeks, startOfWeek, addDays, subDays,
} from 'date-fns';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import { useCollection } from '../../hooks/useCollection';
import { useApp } from '../../context/AppContext';
import { expandRecurrences } from '../../data/calendarUtils';
import { createCalendarEvent } from '../../data/schema';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import MonthView from './MonthView';
import WeekView from './WeekView';
import EventModal from './EventModal';
import ContextMenu from './ContextMenu';
import './Calendar.css';

export default function Calendar() {
  const { items, add, update, remove } = useCollection('calendar_events');
  const { subjects, settings, addXP } = useApp();

  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [modalState, setModalState] = useState({ isOpen: false, event: null });
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, event: null });
  const [confirmState, setConfirmState] = useState({ isOpen: false, eventId: null });

  const examDate = settings.exam_date || null;

  // Compute visible range based on view
  const { rangeStart, rangeEnd } = useMemo(() => {
    if (view === 'month') {
      const ms = startOfMonth(currentDate);
      const me = endOfMonth(currentDate);
      return {
        rangeStart: subDays(ms, 7),
        rangeEnd: addDays(me, 7),
      };
    }
    // week
    const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
    return {
      rangeStart: ws,
      rangeEnd: addDays(ws, 6),
    };
  }, [view, currentDate]);

  const expandedEvents = useMemo(
    () => expandRecurrences(items, rangeStart, rangeEnd),
    [items, rangeStart, rangeEnd]
  );

  // Resolve a possibly-generated event id to its parent id
  function resolveId(event) {
    return event._isGenerated ? event._parentId : event.id;
  }

  function findParent(event) {
    if (!event._isGenerated) return event;
    return items.find(e => e.id === event._parentId) || event;
  }

  // Navigation
  function handlePrev() {
    if (view === 'month') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else {
      setCurrentDate(prev => subWeeks(prev, 1));
    }
  }

  function handleNext() {
    if (view === 'month') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else {
      setCurrentDate(prev => addWeeks(prev, 1));
    }
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  // Event handlers
  function handleCreate(date, time) {
    const event = createCalendarEvent({
      date: date || format(new Date(), 'yyyy-MM-dd'),
      time_start: time || null,
      _isNew: true,
    });
    setModalState({ isOpen: true, event });
  }

  function handleEdit(event) {
    const target = event._isGenerated ? findParent(event) : event;
    setModalState({ isOpen: true, event: target });
  }

  function handleSave(eventData) {
    const existing = items.find(e => e.id === eventData.id);
    if (existing) {
      const prevStatus = existing.status;
      update(eventData.id, eventData);
      if (prevStatus !== 'done' && eventData.status === 'done') {
        addXP(10);
        toast.success('Event completed! +10 XP');
      } else {
        toast.success('Event updated');
      }
    } else {
      const newEvent = createCalendarEvent({ ...eventData, id: eventData.id || uuid() });
      // Remove internal flags
      delete newEvent._isNew;
      delete newEvent._parentId;
      delete newEvent._isGenerated;
      add(newEvent);
      toast.success('Event created');
    }
    setModalState({ isOpen: false, event: null });
  }

  function handleDelete(eventId) {
    // Find the event in expanded list to check if generated
    const expanded = expandedEvents.find(e => e.id === eventId);
    const resolvedId = expanded ? resolveId(expanded) : eventId;
    remove(resolvedId);
    toast.success('Event deleted');
    setModalState({ isOpen: false, event: null });
    setConfirmState({ isOpen: false, eventId: null });
  }

  function handleDeleteConfirm(eventId) {
    setConfirmState({ isOpen: true, eventId });
    setContextMenu({ isOpen: false, x: 0, y: 0, event: null });
  }

  function handleDuplicate(event) {
    const newEvent = createCalendarEvent({
      title: event.title,
      type: event.type,
      subject_id: event.subject_id,
      date: event.date,
      time_start: event.time_start,
      duration_minutes: event.duration_minutes,
      notes: event.notes,
      status: 'pending',
    });
    add(newEvent);
    toast.success('Event duplicated');
  }

  function handleToggleStatus(event) {
    const resolvedId = resolveId(event);
    const newStatus = event.status === 'done' ? 'pending' : 'done';
    update(resolvedId, { status: newStatus });
    if (newStatus === 'done') {
      addXP(10);
      toast.success('Event completed! +10 XP');
    } else {
      toast.success('Event marked as pending');
    }
  }

  // Drop handler for month view
  function handleDropMonth(eventId, dateStr) {
    const expanded = expandedEvents.find(e => e.id === eventId);
    const resolvedId = expanded ? resolveId(expanded) : eventId;
    // Preserve existing time_start
    update(resolvedId, { date: dateStr });
    toast.success('Event moved');
  }

  // Drop handler for week view
  function handleDropWeek(eventId, patch) {
    const expanded = expandedEvents.find(e => e.id === eventId);
    const resolvedId = expanded ? resolveId(expanded) : eventId;
    update(resolvedId, patch);
    toast.success('Event moved');
  }

  // Context menu
  const handleContextMenu = useCallback((e, event) => {
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, event });
  }, []);

  const contextMenuItems = contextMenu.event ? [
    { label: 'Edit', onClick: () => handleEdit(contextMenu.event) },
    { label: 'Duplicate', onClick: () => handleDuplicate(contextMenu.event) },
    {
      label: contextMenu.event.status === 'done' ? 'Mark as pending' : 'Mark as done',
      onClick: () => handleToggleStatus(contextMenu.event),
    },
    {
      label: 'Delete',
      danger: true,
      onClick: () => handleDeleteConfirm(contextMenu.event.id),
    },
  ] : [];

  // Title
  const title = view === 'month'
    ? format(currentDate, 'MMMM yyyy')
    : `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`;

  // Week view start date
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h2 className="calendar-header__title">{title}</h2>

        <div className="calendar-header__nav">
          <button className="calendar-header__nav-btn" onClick={handlePrev} aria-label="Previous">
            &#8592;
          </button>
          <button className="calendar-header__today-btn" onClick={handleToday}>
            Today
          </button>
          <button className="calendar-header__nav-btn" onClick={handleNext} aria-label="Next">
            &#8594;
          </button>
        </div>

        <div className="calendar-header__toggle">
          <button
            className={`calendar-header__toggle-btn ${view === 'month' ? 'calendar-header__toggle-btn--active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button
            className={`calendar-header__toggle-btn ${view === 'week' ? 'calendar-header__toggle-btn--active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
        </div>

        <Button onClick={() => handleCreate()}>+ New Event</Button>
      </div>

      {view === 'month' ? (
        <MonthView
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          events={expandedEvents}
          subjects={subjects}
          examDate={examDate}
          onEventClick={handleEdit}
          onDateClick={(dateStr) => handleCreate(dateStr)}
          onDropEvent={handleDropMonth}
          onContextMenu={handleContextMenu}
        />
      ) : (
        <WeekView
          startDate={weekStart}
          events={expandedEvents}
          subjects={subjects}
          onEventClick={handleEdit}
          onCreateEvent={(date, time) => handleCreate(
            date ? format(date, 'yyyy-MM-dd') : undefined,
            time
          )}
          onEventUpdate={handleDropWeek}
          onContextMenu={handleContextMenu}
        />
      )}

      <EventModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, event: null })}
        event={modalState.event}
        onSave={handleSave}
        onDelete={handleDeleteConfirm}
        subjects={subjects}
      />

      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu({ isOpen: false, x: 0, y: 0, event: null })}
        items={contextMenuItems}
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, eventId: null })}
        onConfirm={() => handleDelete(confirmState.eventId)}
        title="Delete Event"
        message="Are you sure you want to delete this event? This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
