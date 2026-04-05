import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';

const OUTCOME_OPTIONS = [
  { value: 'correct', label: 'Correct' },
  { value: 'incorrect', label: 'Incorrect' },
  { value: 'partial', label: 'Partial' },
];

export default function ExerciseForm({
  isOpen,
  onClose,
  exercise,
  subjects,
  categories,
  topics,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (exercise) {
      setForm({ ...exercise });
    }
  }, [exercise]);

  if (!exercise) return null;

  const isEditing = Boolean(exercise.id && exercise.title);

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
    onSave(form);
  }

  // Group topics by subject
  const grouped = subjects.map((subj) => {
    const subCats = categories.filter((c) => c.subject_id === subj.id);
    const subTopics = subCats.flatMap((cat) =>
      topics.filter((t) => t.category_id === cat.id),
    );
    return { subject: subj, topics: subTopics };
  }).filter((g) => g.topics.length > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Exercise' : 'New Exercise'}
    >
      <form onSubmit={handleSubmit} className="exercise-form">
        <Input
          label="Title"
          id="ex-title"
          value={form.title || ''}
          onChange={(e) => patch('title', e.target.value)}
          placeholder="Exercise title or question"
        />

        <div className="form-field">
          <label className="form-label">Topics</label>
          <div className="exercise-form__topics">
            {grouped.map(({ subject, topics: subTopics }) => (
              <div key={subject.id} className="exercise-form__topic-group">
                <div className="exercise-form__topic-subject" style={{ color: subject.colour }}>
                  {subject.name}
                </div>
                {subTopics.map((topic) => (
                  <label key={topic.id} className="exercise-form__topic-check">
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
              <p className="text-muted text-xs">No topics defined yet. Add subjects first.</p>
            )}
          </div>
        </div>

        <div className="exercise-form__row">
          <Input
            label="Date"
            id="ex-date"
            type="date"
            value={form.date || ''}
            onChange={(e) => patch('date', e.target.value)}
          />
          <Input
            label="Duration (min)"
            id="ex-duration"
            type="number"
            min="0"
            value={form.duration_min ?? ''}
            onChange={(e) => patch('duration_min', e.target.value ? Number(e.target.value) : null)}
          />
        </div>

        <Select
          label="Outcome"
          id="ex-outcome"
          options={OUTCOME_OPTIONS}
          value={form.outcome || 'correct'}
          onChange={(e) => patch('outcome', e.target.value)}
        />

        <div className="exercise-form__row">
          <Input
            label="Score"
            id="ex-score"
            type="number"
            min="0"
            step="0.5"
            value={form.score ?? ''}
            onChange={(e) => patch('score', e.target.value ? Number(e.target.value) : null)}
          />
          <Input
            label="Max Score"
            id="ex-max-score"
            type="number"
            min="0"
            step="0.5"
            value={form.max_score ?? ''}
            onChange={(e) => patch('max_score', e.target.value ? Number(e.target.value) : null)}
          />
        </div>

        <Textarea
          label="Notes"
          id="ex-notes"
          rows={3}
          value={form.notes || ''}
          onChange={(e) => patch('notes', e.target.value)}
        />

        <div className="exercise-form__confab">
          <Toggle
            label="Confabulation flagged"
            id="ex-confab"
            checked={form.confab_flagged || false}
            onChange={(val) => patch('confab_flagged', val)}
          />
          {form.confab_flagged && (
            <Input
              label="Reason"
              id="ex-confab-reason"
              value={form.confab_reason || ''}
              onChange={(e) => patch('confab_reason', e.target.value)}
              placeholder="Why is this flagged?"
            />
          )}
        </div>

        <div className="exercise-form__actions">
          <Button type="submit">Save</Button>
          {isEditing && (
            <Button variant="danger" onClick={() => onDelete(form.id)}>
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
