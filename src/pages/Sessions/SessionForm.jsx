import { useState, useEffect } from 'react';
import { SESSION_TYPES } from '../../data/schema';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function SessionForm({
  isOpen,
  onClose,
  session,
  subjects,
  categories,
  topics,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (session) {
      setForm({ ...session });
    }
  }, [session]);

  if (!session) return null;

  const isEditing = Boolean(
    session.id &&
      (session.duration_min > 0 || session.notes || (session.topic_ids || []).length > 0),
  );

  function patch(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTopic(topicId) {
    setForm((prev) => {
      const ids = prev.topic_ids || [];
      return {
        ...prev,
        topic_ids: ids.includes(topicId)
          ? ids.filter((id) => id !== topicId)
          : [...ids, topicId],
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const xp = Math.round((form.duration_min || 0) * 0.5);
    onSave({ ...form, xp });
  }

  // Group topics by subject
  const grouped = subjects
    .map((subj) => {
      const subCats = categories.filter((c) => c.subject_id === subj.id);
      const subTopics = subCats.flatMap((cat) =>
        topics.filter((t) => t.category_id === cat.id),
      );
      return { subject: subj, topics: subTopics };
    })
    .filter((g) => g.topics.length > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Session' : 'New Session'}
    >
      <form onSubmit={handleSubmit} className="session-form">
        <Select
          label="Type"
          id="sess-type"
          options={SESSION_TYPES}
          value={form.type || 'exercise_set'}
          onChange={(e) => patch('type', e.target.value)}
        />

        <div className="session-form__row">
          <Input
            label="Date"
            id="sess-date"
            type="date"
            value={form.date || ''}
            onChange={(e) => patch('date', e.target.value)}
          />
          <Input
            label="Duration (min)"
            id="sess-duration"
            type="number"
            min="0"
            value={form.duration_min ?? ''}
            onChange={(e) =>
              patch('duration_min', e.target.value ? Number(e.target.value) : 0)
            }
          />
        </div>

        <Input
          label="Count (optional)"
          id="sess-count"
          type="number"
          min="0"
          value={form.count ?? ''}
          onChange={(e) =>
            patch('count', e.target.value ? Number(e.target.value) : null)
          }
        />

        <div className="form-field">
          <label className="form-label">Topics</label>
          <div className="session-form__topics">
            {grouped.map(({ subject, topics: subTopics }) => (
              <div key={subject.id} className="session-form__topic-group">
                <div
                  className="session-form__topic-subject"
                  style={{ color: subject.colour }}
                >
                  {subject.name}
                </div>
                {subTopics.map((topic) => (
                  <label key={topic.id} className="session-form__topic-check">
                    <input
                      type="checkbox"
                      checked={(form.topic_ids || []).includes(topic.id)}
                      onChange={() => toggleTopic(topic.id)}
                    />
                    <span>{topic.name}</span>
                  </label>
                ))}
              </div>
            ))}
            {grouped.length === 0 && (
              <p className="text-muted text-xs">
                No topics defined yet. Add subjects first.
              </p>
            )}
          </div>
        </div>

        <Textarea
          label="Notes"
          id="sess-notes"
          rows={3}
          value={form.notes || ''}
          onChange={(e) => patch('notes', e.target.value)}
        />

        <div className="session-form__xp-preview">
          XP earned: <strong>{Math.round((form.duration_min || 0) * 0.5)}</strong>
        </div>

        <div className="session-form__actions">
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
