import { format, parseISO } from 'date-fns';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const TIPO_COLOURS = {
  A: '#2563eb',
  B: '#9333ea',
  C: '#059669',
};

export default function EssayCard({ essay, onClick }) {
  const tipoColour = TIPO_COLOURS[essay.tipo] || '#888';

  return (
    <Card className="essay-card" onClick={onClick}>
      <div className="essay-card__header">
        <Badge colour={tipoColour}>Tipo {essay.tipo}</Badge>
        {essay.grade != null && (
          <span className="essay-card__grade">{essay.grade}</span>
        )}
      </div>

      <div className="essay-card__title">{essay.title || 'Untitled essay'}</div>

      <div className="essay-card__meta">
        <span>{format(parseISO(essay.date), 'MMM d, yyyy')}</span>
        {essay.word_count != null && <span>{essay.word_count} words</span>}
        {essay.duration_min != null && <span>{essay.duration_min} min</span>}
      </div>

      {essay.feedback && (
        <p className="essay-card__feedback">
          {essay.feedback.length > 100
            ? essay.feedback.slice(0, 100) + '...'
            : essay.feedback}
        </p>
      )}
    </Card>
  );
}
