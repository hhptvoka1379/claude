import { format, parseISO } from 'date-fns';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import SubjectTag from '../../components/shared/SubjectTag';

const OUTCOME_MAP = {
  correct: { label: 'Correct', colour: 'var(--colour-success)' },
  partial: { label: 'Partial', colour: 'var(--colour-warning)' },
  incorrect: { label: 'Incorrect', colour: 'var(--colour-error)' },
};

export default function ExerciseCard({ exercise, subjects, categories, topics, onClick }) {
  const outcome = OUTCOME_MAP[exercise.outcome] || OUTCOME_MAP.correct;

  // Resolve topic_ids to topic objects with subject colours
  const resolvedTopics = (exercise.topic_ids || []).map((tid) => {
    const topic = topics.find((t) => t.id === tid);
    if (!topic) return null;
    const category = categories.find((c) => c.id === topic.category_id);
    const subject = category ? subjects.find((s) => s.id === category.subject_id) : null;
    return {
      id: tid,
      name: topic.name,
      colour: subject ? subject.colour : '#888',
    };
  }).filter(Boolean);

  return (
    <Card className="exercise-card" onClick={onClick}>
      <div className="exercise-card__header">
        <span className="exercise-card__title">{exercise.title || 'Untitled exercise'}</span>
        <Badge colour={outcome.colour}>{outcome.label}</Badge>
      </div>

      {resolvedTopics.length > 0 && (
        <div className="exercise-card__topics">
          {resolvedTopics.map((t) => (
            <SubjectTag key={t.id} name={t.name} colour={t.colour} />
          ))}
        </div>
      )}

      <div className="exercise-card__meta">
        <span>{format(parseISO(exercise.date), 'MMM d, yyyy')}</span>
        {exercise.duration_min != null && <span>{exercise.duration_min} min</span>}
        {exercise.score != null && exercise.max_score != null && (
          <span className="exercise-card__score">{exercise.score}/{exercise.max_score}</span>
        )}
        {exercise.confab_flagged && (
          <span
            className="exercise-card__confab"
            title={exercise.confab_reason || 'Confabulation flagged'}
          >
            &#9888;
          </span>
        )}
      </div>
    </Card>
  );
}
