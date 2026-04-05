import { format, parseISO } from 'date-fns';
import { SESSION_TYPES } from '../../data/schema';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import SubjectTag from '../../components/shared/SubjectTag';

function formatDuration(min) {
  if (!min || min <= 0) return '0m';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function SessionCard({ session, subjects, categories, topics, onClick }) {
  const typeLabel =
    SESSION_TYPES.find((t) => t.value === session.type)?.label || session.type;

  const resolvedTopics = (session.topic_ids || [])
    .map((tid) => {
      const topic = topics.find((t) => t.id === tid);
      if (!topic) return null;
      const category = categories.find((c) => c.id === topic.category_id);
      const subject = category
        ? subjects.find((s) => s.id === category.subject_id)
        : null;
      return {
        id: tid,
        name: topic.name,
        colour: subject ? subject.colour : '#888',
      };
    })
    .filter(Boolean);

  return (
    <Card className="session-card" onClick={onClick}>
      <div className="session-card__header">
        <Badge colour="var(--colour-accent, #6b4f3a)" variant="outline">
          {typeLabel}
        </Badge>
        {session.xp > 0 && (
          <Badge colour="var(--colour-success, #2e7d32)">+{session.xp} XP</Badge>
        )}
      </div>

      <div className="session-card__duration">{formatDuration(session.duration_min)}</div>

      <div className="session-card__meta">
        <span>{format(parseISO(session.date), 'MMM d, yyyy')}</span>
        {session.count != null && session.count > 0 && (
          <span>{session.count} exercises</span>
        )}
      </div>

      {resolvedTopics.length > 0 && (
        <div className="session-card__topics">
          {resolvedTopics.map((t) => (
            <SubjectTag key={t.id} name={t.name} colour={t.colour} />
          ))}
        </div>
      )}

      {session.notes && (
        <p className="session-card__notes">
          {session.notes.length > 100
            ? session.notes.slice(0, 100) + '...'
            : session.notes}
        </p>
      )}
    </Card>
  );
}
