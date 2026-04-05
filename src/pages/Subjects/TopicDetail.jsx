import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Textarea from '../../components/ui/Textarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const OUTCOME_COLOURS = {
  correct: 'var(--colour-success, #4a7c59)',
  partial: 'var(--colour-warning, #c07a30)',
  incorrect: 'var(--colour-danger, #c05050)',
};

const OUTCOME_LABELS = {
  correct: 'Correct',
  partial: 'Partial',
  incorrect: 'Incorrect',
};

export default function TopicDetail({
  topicId,
  subjects,
  categories,
  topics,
  exercises,
  grades,
  updateTopic,
  removeTopic,
  onSelectTopic,
}) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const topic = useMemo(
    () => topics.find((t) => t.id === topicId),
    [topics, topicId]
  );

  const category = useMemo(
    () => (topic ? categories.find((c) => c.id === topic.category_id) : null),
    [categories, topic]
  );

  const subject = useMemo(
    () => (category ? subjects.find((s) => s.id === category.subject_id) : null),
    [subjects, category]
  );

  // All topics in same category for progress
  const siblingTopics = useMemo(
    () => (category ? topics.filter((t) => t.category_id === category.id) : []),
    [topics, category]
  );

  const completedCount = useMemo(
    () => siblingTopics.filter((t) => t.completed).length,
    [siblingTopics]
  );

  // Exercises linked to this topic
  const topicExercises = useMemo(
    () =>
      exercises.filter(
        (e) => e.topic_ids && e.topic_ids.includes(topicId)
      ).sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [exercises, topicId]
  );

  const handleNotesBlur = useCallback(
    (e) => {
      updateTopic(topicId, { notes: e.target.value });
    },
    [updateTopic, topicId]
  );

  const handleToggleCompleted = useCallback(() => {
    const newValue = !topic.completed;
    updateTopic(topicId, { completed: newValue });
    toast.success(newValue ? 'Topic marked as completed' : 'Topic marked as incomplete');
  }, [updateTopic, topicId, topic]);

  const handleDelete = useCallback(() => {
    removeTopic(topicId);
    onSelectTopic(null);
    toast.success('Topic removed');
  }, [removeTopic, topicId, onSelectTopic]);

  if (!topic) {
    return (
      <Card>
        <div className="topic-detail">
          <p style={{ color: 'var(--colour-text-muted)' }}>Topic not found.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="topic-detail">
        {/* Breadcrumb */}
        <div className="topic-breadcrumb">
          {subject && (
            <span onClick={() => onSelectTopic(null)}>
              {subject.name}
            </span>
          )}
          {category && (
            <>
              <span className="breadcrumb-sep">/</span>
              <span onClick={() => onSelectTopic(null)}>
                {category.name}
              </span>
            </>
          )}
          <span className="breadcrumb-sep">/</span>
          <span style={{ color: 'var(--colour-text)', fontWeight: 500 }}>
            {topic.name}
          </span>
        </div>

        {/* Heading + completed toggle */}
        <div className="topic-heading">
          <h2>{topic.name}</h2>
          <label className="topic-completed-toggle">
            <input
              type="checkbox"
              checked={topic.completed}
              onChange={handleToggleCompleted}
            />
            Completed
          </label>
        </div>

        {/* Progress in category */}
        {siblingTopics.length > 0 && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.8rem', color: 'var(--colour-text-muted)', marginBottom: 4,
            }}>
              <span>Category progress</span>
              <span className="mono">{completedCount}/{siblingTopics.length}</span>
            </div>
            <ProgressBar
              value={completedCount}
              max={siblingTopics.length}
              colour={subject?.colour}
            />
          </div>
        )}

        {/* Notes */}
        <div className="topic-notes">
          <h4>Notes</h4>
          <Textarea
            id={`notes-${topicId}`}
            rows={5}
            defaultValue={topic.notes || ''}
            key={topicId}
            onBlur={handleNotesBlur}
            placeholder="Add notes about this topic..."
          />
        </div>

        {/* Exercises */}
        <div className="topic-exercises">
          <h4>
            <span>Exercises ({topicExercises.length})</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/exercises')}
            >
              + Add exercise
            </Button>
          </h4>

          {topicExercises.length === 0 && (
            <p style={{ color: 'var(--colour-text-muted)', fontSize: '0.85rem' }}>
              No exercises linked to this topic yet.
            </p>
          )}

          {topicExercises.map((ex) => (
            <div key={ex.id} className="exercise-mini-card">
              <span className="exercise-mini-card__title">
                {ex.title || 'Untitled exercise'}
              </span>
              <span className="exercise-mini-card__date">{ex.date}</span>
              {ex.score != null && ex.max_score != null && (
                <span className="exercise-mini-card__score">
                  {ex.score}/{ex.max_score}
                </span>
              )}
              <Badge
                colour={OUTCOME_COLOURS[ex.outcome] || OUTCOME_COLOURS.correct}
                variant="filled"
              >
                {OUTCOME_LABELS[ex.outcome] || ex.outcome}
              </Badge>
            </div>
          ))}
        </div>

        {/* Delete */}
        <div style={{ marginTop: 'var(--space-xl, 32px)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--colour-border)' }}>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            Delete topic
          </Button>
        </div>

        <ConfirmDialog
          isOpen={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          title="Delete Topic"
          message={`Are you sure you want to delete "${topic.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
        />
      </div>
    </Card>
  );
}
