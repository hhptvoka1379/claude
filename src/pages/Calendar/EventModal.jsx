import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';
import { EVENT_TYPES, EVENT_STATUSES } from '../../data/schema';
import './EventModal.css';

export default function EventModal({ isOpen, onClose, event, onSave, onDelete, subjects }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('study');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [noTime, setNoTime] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending');
  const [recurring, setRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [recurrenceUntil, setRecurrenceUntil] = useState('');

  const isEditing = event && !event._isNew;

  useEffect(() => {
    if (!isOpen) return;
    if (event) {
      setTitle(event.title || '');
      setType(event.type || 'study');
      setSubjectId(event.subject_id || '');
      setDate(event.date || new Date().toISOString().split('T')[0]);
      setTimeStart(event.time_start || '');
      setNoTime(!event.time_start);
      setDurationMinutes(event.duration_minutes || 60);
      setNotes(event.notes || '');
      setStatus(event.status || 'pending');
      setRecurring(!!event.recurrence);
      setRecurrenceType(event.recurrence?.type || 'daily');
      setRecurrenceUntil(event.recurrence?.until || '');
    } else {
      setTitle('');
      setType('study');
      setSubjectId('');
      setDate(new Date().toISOString().split('T')[0]);
      setTimeStart('');
      setNoTime(true);
      setDurationMinutes(60);
      setNotes('');
      setStatus('pending');
      setRecurring(false);
      setRecurrenceType('daily');
      setRecurrenceUntil('');
    }
  }, [isOpen, event]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const eventData = {
      ...(event || {}),
      title: title.trim(),
      type,
      subject_id: subjectId || null,
      date,
      time_start: noTime ? null : (timeStart || null),
      duration_minutes: parseInt(durationMinutes) || 60,
      notes,
      status,
      recurrence: recurring ? {
        type: recurrenceType,
        until: recurrenceUntil || null,
      } : null,
    };

    // Remove internal flags
    delete eventData._isNew;
    delete eventData._parentId;
    delete eventData._isGenerated;

    onSave(eventData);
  }

  const subjectOptions = [
    { value: '', label: 'None (no subject)' },
    ...subjects.map(s => ({ value: s.id, label: s.name })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Event' : 'New Event'} wide>
      <form onSubmit={handleSubmit} className="event-modal-form">
        <Input
          label="Title"
          id="event-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Integrali definiti — 3 esercizi"
          autoFocus
        />

        <div className="form-row">
          <Select
            label="Type"
            id="event-type"
            value={type}
            onChange={e => setType(e.target.value)}
            options={EVENT_TYPES}
          />
          <Select
            label="Subject"
            id="event-subject"
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
            options={subjectOptions}
          />
        </div>

        <div className="form-row">
          <Input
            label="Date"
            id="event-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <div className="form-field">
            <label className="form-label" htmlFor="event-time">Time</label>
            <div className="event-modal-time-row">
              <input
                id="event-time"
                type="time"
                step="900"
                className="form-input"
                value={noTime ? '' : timeStart}
                onChange={e => { setTimeStart(e.target.value); setNoTime(false); }}
                disabled={noTime}
                style={{ flex: 1 }}
              />
              <label className="event-modal-no-time">
                <input
                  type="checkbox"
                  checked={noTime}
                  onChange={e => {
                    setNoTime(e.target.checked);
                    if (e.target.checked) setTimeStart('');
                  }}
                />
                <span className="text-xs">Unscheduled</span>
              </label>
            </div>
          </div>
        </div>

        <Input
          label="Duration (minutes)"
          id="event-duration"
          type="number"
          min="15"
          step="15"
          value={durationMinutes}
          onChange={e => setDurationMinutes(e.target.value)}
        />

        <Textarea
          label="Notes"
          id="event-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional notes..."
        />

        {isEditing && (
          <Select
            label="Status"
            id="event-status"
            value={status}
            onChange={e => setStatus(e.target.value)}
            options={EVENT_STATUSES}
          />
        )}

        <div className="event-modal-recurrence">
          <Toggle
            id="event-recurring"
            label="Recurring"
            checked={recurring}
            onChange={setRecurring}
          />
          {recurring && (
            <div className="form-row" style={{ marginTop: '8px' }}>
              <Select
                label="Repeat"
                id="event-recurrence-type"
                value={recurrenceType}
                onChange={e => setRecurrenceType(e.target.value)}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                ]}
              />
              <Input
                label="Until"
                id="event-recurrence-until"
                type="date"
                value={recurrenceUntil}
                onChange={e => setRecurrenceUntil(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          {isEditing && onDelete && (
            <Button variant="danger" type="button" onClick={() => onDelete(event.id)}>
              Delete
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{isEditing ? 'Save Changes' : 'Create Event'}</Button>
        </div>
      </form>
    </Modal>
  );
}
