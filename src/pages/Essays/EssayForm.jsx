import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const TIPO_OPTIONS = [
  { value: 'A', label: 'Tipo A' },
  { value: 'B', label: 'Tipo B' },
  { value: 'C', label: 'Tipo C' },
];

export default function EssayForm({ isOpen, onClose, essay, onSave, onDelete }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (essay) {
      setForm({ ...essay });
    }
  }, [essay]);

  if (!essay) return null;

  const isEditing = Boolean(essay.id && essay.title);

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
      title={isEditing ? 'Edit Essay' : 'New Essay'}
      wide
    >
      <form onSubmit={handleSubmit} className="essay-form">
        <div className="essay-form__row">
          <Select
            label="Tipo"
            id="essay-tipo"
            options={TIPO_OPTIONS}
            value={form.tipo || 'A'}
            onChange={(e) => patch('tipo', e.target.value)}
          />
          <Input
            label="Title"
            id="essay-title"
            value={form.title || ''}
            onChange={(e) => patch('title', e.target.value)}
            placeholder="Essay title"
          />
        </div>

        <div className="essay-form__row">
          <Input
            label="Date"
            id="essay-date"
            type="date"
            value={form.date || ''}
            onChange={(e) => patch('date', e.target.value)}
          />
          <Input
            label="Word Count"
            id="essay-words"
            type="number"
            min="0"
            value={form.word_count ?? ''}
            onChange={(e) => patch('word_count', e.target.value ? Number(e.target.value) : null)}
          />
          <Input
            label="Duration (min)"
            id="essay-duration"
            type="number"
            min="0"
            value={form.duration_min ?? ''}
            onChange={(e) => patch('duration_min', e.target.value ? Number(e.target.value) : null)}
          />
        </div>

        <Input
          label="Grade (0-10)"
          id="essay-grade"
          type="number"
          min="0"
          max="10"
          step="0.5"
          value={form.grade ?? ''}
          onChange={(e) => patch('grade', e.target.value ? Number(e.target.value) : null)}
        />

        <Textarea
          label="Prompt"
          id="essay-prompt"
          rows={3}
          value={form.prompt_text || ''}
          onChange={(e) => patch('prompt_text', e.target.value)}
          placeholder="The essay prompt or question..."
        />

        <Textarea
          label="Feedback"
          id="essay-feedback"
          rows={3}
          value={form.feedback || ''}
          onChange={(e) => patch('feedback', e.target.value)}
          placeholder="Teacher feedback or self-assessment..."
        />

        <Textarea
          label="Content"
          id="essay-content"
          rows={8}
          value={form.content || ''}
          onChange={(e) => patch('content', e.target.value)}
          placeholder="Essay text..."
        />

        <div className="essay-form__actions">
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
