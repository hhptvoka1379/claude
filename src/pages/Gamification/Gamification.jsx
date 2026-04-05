import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import CalendarHeatmap from '../../components/shared/CalendarHeatmap';
import WeeklyChart from '../../components/shared/WeeklyChart';
import { format, parseISO, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import './Gamification.css';

export default function Gamification() {
  const { gameState, settings } = useApp();
  const { items: sessions } = useCollection('sessions', []);

  if (!settings.gamification_enabled) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Gamification</h1>
          <p className="page-subtitle">Gamification is disabled. Enable it in Settings.</p>
        </div>
      </div>
    );
  }

  const heatmapData = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      const d = s.date;
      map[d] = (map[d] || 0) + (s.duration_min || 0);
    });
    return map;
  }, [sessions]);

  const weeklyXP = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: today });
    return days.map(d => {
      const key = format(d, 'yyyy-MM-dd');
      const daySessions = sessions.filter(s => s.date === key);
      const xp = daySessions.reduce((sum, s) => sum + (s.xp || 0), 0);
      return { name: format(d, 'EEE'), value: xp };
    });
  }, [sessions]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gamification</h1>
        <p className="page-subtitle">Track your progress, earn rewards, stay motivated</p>
      </div>

      {/* Stats row */}
      <div className="gamification-stats">
        <Card className="gamification-stat">
          <div className="gamification-stat__icon">{'\u{1F525}'}</div>
          <div className="gamification-stat__value mono">{gameState.streak_days}</div>
          <div className="gamification-stat__label text-muted">Day Streak</div>
        </Card>
        <Card className="gamification-stat">
          <div className="gamification-stat__icon">{'\u{1F4C4}'}</div>
          <div className="gamification-stat__value mono">{gameState.pagine.toLocaleString()}</div>
          <div className="gamification-stat__label text-muted">Pagine (XP)</div>
        </Card>
        <Card className="gamification-stat">
          <div className="gamification-stat__icon">{'\u{1F3C5}'}</div>
          <div className="gamification-stat__value mono">{gameState.capitoli.length}</div>
          <div className="gamification-stat__label text-muted">Capitoli (Badges)</div>
        </Card>
        <Card className="gamification-stat">
          <div className="gamification-stat__icon">{'\u{1F3C6}'}</div>
          <div className="gamification-stat__value mono">{gameState.passe.length}</div>
          <div className="gamification-stat__label text-muted">Passe (Collectibles)</div>
        </Card>
      </div>

      {/* Streak Calendar */}
      <Card className="gamification-section">
        <h3>Activity Heatmap — Last 60 Days</h3>
        <p className="text-xs text-muted" style={{ marginBottom: '12px' }}>
          Minutes of study per day
        </p>
        <CalendarHeatmap data={heatmapData} days={60} colour="#6b4f3a" />
      </Card>

      {/* Weekly XP Chart */}
      <Card className="gamification-section">
        <h3>XP This Week</h3>
        <WeeklyChart data={weeklyXP} dataKey="value" colour="#6b4f3a" height={180} />
      </Card>

      {/* Badges */}
      <Card className="gamification-section">
        <h3>Capitoli (Badges)</h3>
        {gameState.capitoli.length === 0 ? (
          <p className="text-muted">Complete topics to earn badges.</p>
        ) : (
          <div className="badge-grid">
            {gameState.capitoli.map(cap => (
              <div key={cap.id} className="badge-item">
                <div className="badge-item__icon">{'\u{1F4D6}'}</div>
                <div className="badge-item__name">{cap.name}</div>
                <div className="badge-item__date text-xs text-muted">
                  {format(parseISO(cap.earned_at), 'MMM d')}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Collectibles */}
      <Card className="gamification-section">
        <h3>Passe (Collectibles)</h3>
        {gameState.passe.length === 0 ? (
          <p className="text-muted">Earn collectibles through streaks, personal bests, and great grades.</p>
        ) : (
          <div className="badge-grid">
            {gameState.passe.map(pass => (
              <div key={pass.id} className="badge-item badge-item--collectible">
                <div className="badge-item__icon">{'\u{2B50}'}</div>
                <div className="badge-item__name">{pass.name}</div>
                <div className="badge-item__desc text-xs text-muted">{pass.description}</div>
                <div className="badge-item__date text-xs text-muted">
                  {format(parseISO(pass.earned_at), 'MMM d')}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
