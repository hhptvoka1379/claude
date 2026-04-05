import { format, parseISO } from 'date-fns';
import { PCTO_STATUSES } from '../../data/schema';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';

const STATUS_COLOURS = {
  pending: '#8a7a6a',
  in_progress: '#1976d2',
  awaiting_certification: '#f59e0b',
  complete: '#2e7d32',
};

export default function PCTOCard({ activity, onClick }) {
  const statusLabel =
    PCTO_STATUSES.find((s) => s.value === activity.status)?.label || activity.status;
  const statusColour = STATUS_COLOURS[activity.status] || '#8a7a6a';

  return (
    <Card
      className={`pcto-card${activity.pinned ? ' pcto-card--pinned' : ''}`}
      onClick={onClick}
    >
      {activity.pinned && (
        <div className="pcto-card__urgent">
          <span className="pcto-card__urgent-icon">&#9888;</span> URGENT
        </div>
      )}

      <h3 className="pcto-card__name">{activity.name || 'Untitled activity'}</h3>

      <div className="pcto-card__hours">
        <span className="pcto-card__hours-text">
          Hours logged: <strong>{activity.hours_logged}</strong> &middot; Target:{' '}
          <strong>{activity.hours_required}</strong>
        </span>
        <ProgressBar
          value={activity.hours_logged}
          max={activity.hours_required || 1}
          height={10}
          colour={statusColour}
          showLabel
        />
      </div>

      <div className="pcto-card__status">
        <Badge colour={statusColour}>{statusLabel}</Badge>
      </div>

      {activity.contact && (
        <div className="pcto-card__detail">
          <span className="pcto-card__label">Contact:</span> {activity.contact}
        </div>
      )}

      {activity.deadline && (
        <div className="pcto-card__detail">
          <span className="pcto-card__label">Deadline:</span>{' '}
          {format(parseISO(activity.deadline), 'MMM d, yyyy')}
        </div>
      )}

      {activity.next_action && (
        <div className="pcto-card__next-action">
          <span className="pcto-card__label">Next action:</span>{' '}
          {activity.next_action}
        </div>
      )}

      {activity.notes && (
        <p className="pcto-card__notes">
          {activity.notes.length > 120
            ? activity.notes.slice(0, 120) + '...'
            : activity.notes}
        </p>
      )}
    </Card>
  );
}
