import { useState, useMemo } from 'react';
import { format, parseISO, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import toast from 'react-hot-toast';

import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import { createSession, SESSION_TYPES } from '../../data/schema';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import MetricCard from '../../components/shared/MetricCard';
import WeeklyChart from '../../components/shared/WeeklyChart';

import SessionCard from './SessionCard';
import SessionForm from './SessionForm';
import './Sessions.css';

export default function Sessions() {
  const { subjects, categories, topics, settings, addXP } = useApp();
  const { items: sessions, add, update, remove } = useCollection('sessions');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  // --- Metrics ---
  const metrics = useMemo(() => {
    const total = sessions.length;

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeek = sessions.filter((s) => {
      const d = parseISO(s.date);
      return d >= weekStart && d <= now;
    });
    const totalHoursThisWeek = (
      thisWeek.reduce((sum, s) => sum + (s.duration_min || 0), 0) / 60
    ).toFixed(1);

    const withDuration = sessions.filter((s) => s.duration_min > 0);
    const avgDuration =
      withDuration.length > 0
        ? Math.round(
            withDuration.reduce((sum, s) => sum + s.duration_min, 0) /
              withDuration.length,
          )
        : 0;

    return { total, totalHoursThisWeek, avgDuration };
  }, [sessions]);

  // --- Weekly chart data ---
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: now });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayMins = sessions
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + (s.duration_min || 0), 0);
      return {
        name: dayNames[day.getDay()],
        value: parseFloat((dayMins / 60).toFixed(2)),
      };
    });
  }, [sessions]);

  // --- Filtering ---
  const filtered = useMemo(() => {
    let result = [...sessions];

    if (filterType !== 'all') {
      result = result.filter((s) => s.type === filterType);
    }

    if (filterSubject !== 'all') {
      const subjectCats = categories.filter((c) => c.subject_id === filterSubject);
      const subjectTopicIds = new Set(
        subjectCats.flatMap((cat) =>
          topics.filter((t) => t.category_id === cat.id).map((t) => t.id),
        ),
      );
      result = result.filter((s) =>
        (s.topic_ids || []).some((tid) => subjectTopicIds.has(tid)),
      );
    }

    result.sort((a, b) => b.date.localeCompare(a.date));
    return result;
  }, [sessions, filterType, filterSubject, categories, topics]);

  // --- Options ---
  const typeOptions = [
    { value: 'all', label: 'All types' },
    ...SESSION_TYPES,
  ];

  const subjectOptions = [
    { value: 'all', label: 'All subjects' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  // --- Handlers ---
  function handleNewSession() {
    setEditingSession(createSession());
    setModalOpen(true);
  }

  function handleEditSession(session) {
    setEditingSession({ ...session });
    setModalOpen(true);
  }

  function handleSave(data) {
    const existing = sessions.find((s) => s.id === data.id);
    if (existing) {
      const xpDiff = data.xp - (existing.xp || 0);
      update(data.id, data);
      if (xpDiff > 0) addXP(xpDiff);
      toast.success('Session updated');
    } else {
      add(data);
      if (data.xp > 0) addXP(data.xp);
      toast.success('Session logged');
    }
    setModalOpen(false);
    setEditingSession(null);
  }

  function handleDelete(id) {
    remove(id);
    toast.success('Session deleted');
    setModalOpen(false);
    setEditingSession(null);
  }

  return (
    <div className="sessions-page">
      <div className="sessions-page__header">
        <h1>Study Sessions</h1>
        <Button onClick={handleNewSession}>+ New Session</Button>
      </div>

      <div className="sessions-page__metrics">
        <MetricCard label="Total sessions" value={metrics.total} />
        <MetricCard
          label="Hours this week"
          value={metrics.totalHoursThisWeek}
          unit="h"
        />
        <MetricCard
          label="Avg duration"
          value={metrics.avgDuration}
          unit="min"
        />
      </div>

      <div className="sessions-filters">
        <Select
          id="filter-type"
          options={typeOptions}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        />
        <Select
          id="filter-subject"
          options={subjectOptions}
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        />
      </div>

      <Card className="sessions-page__chart">
        <WeeklyChart
          data={weeklyData}
          label="Hours studied per day this week"
          colour="var(--colour-accent, #6b4f3a)"
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No sessions yet"
          description="Log your study sessions to track time and earn XP."
          action={<Button onClick={handleNewSession}>+ New Session</Button>}
        />
      ) : (
        <div className="sessions-grid">
          {filtered.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              subjects={subjects}
              categories={categories}
              topics={topics}
              onClick={() => handleEditSession(session)}
            />
          ))}
        </div>
      )}

      <SessionForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSession(null);
        }}
        session={editingSession}
        subjects={subjects}
        categories={categories}
        topics={topics}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
