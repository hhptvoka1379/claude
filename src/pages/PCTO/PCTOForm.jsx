import { useState, useEffect } from 'react';
import { PCTO_STATUSES } from '../../data/schema';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';

export default function PCTOForm({
  isOpen,
  onClose,
  activity,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (activity) {
      setForm({ ...activity });
    }
  }, [activity]);

  if (!activity) return null;

  const isEditing = Boolean(activity.id && activity.name);

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Activity' : 'New Activity'}
    >
      <form onSubmit={handleSubmit} className="pcto-form">
        <Input
          label="Name"
          id="pcto-name"
          value={form.name || ''}
          onChange={(e) => patch('name', e.target.value)}
          placeholder="Activity name"
        />

        <div className="pcto-form__row">
          <Input
            label="Hours logged"
            id="pcto-hours-logged"
            type="number"
            min="0"
            step="0.5"
            value={form.hours_logged ?? ''}
            onChange={(e) =>
              patch('hours_logged', e.target.value ? Number(e.target.value) : 0)
            }
          />
          <Input
            label="Hours required"
            id="pcto-hours-required"
            type="number"
            min="0"
            step="0.5"
            value={form.hours_required ?? ''}
            onChange={(e) =>
              patch('hours_required', e.target.value ? Number(e.target.value) : 0)
            }
          />
        </div>

        <Select
          label="Status"
          id="pcto-status"
          options={PCTO_STATUSES}
          value={form.status || 'pending'}
          onChange={(e) => patch('status', e.target.value)}
        />

        <Input
          label="Contact person"
          id="pcto-contact"
          value={form.contact || ''}
          onChange={(e) => patch('contact', e.target.value)}
          placeholder="Name or email"
        />

        <Input
          label="Deadline"
          id="pcto-deadline"
          type="date"
          value={form.deadline || ''}
          onChange={(e) => patch('deadline', e.target.value)}
        />

        <Input
          label="Next action"
          id="pcto-next-action"
          value={form.next_action || ''}
          onChange={(e) => patch('next_action', e.target.value)}
          placeholder="What needs to happen next?"
          className="pcto-form__next-action-input"
        />

        <Textarea
          label="Notes"
          id="pcto-notes"
          rows={3}
          value={form.notes || ''}
          onChange={(e) => patch('notes', e.target.value)}
        />

        <Toggle
          label="Pinned (urgent)"
          id="pcto-pinned"
          checked={form.pinned || false}
          onChange={(val) => patch('pinned', val)}
        />

        <div className="pcto-form__actions">
          <Button type="submit">Save</Button>
          {isEditing && (
            <Button
              variant="danger"
              type="button"
              onClick={() => onDelete(form.id)}
            >
              Delete
            </Button>
          )}
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
