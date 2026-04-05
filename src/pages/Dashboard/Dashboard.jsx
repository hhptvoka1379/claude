import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import { useCountdown } from '../../hooks/useCountdown';
import { calculateReadiness, getRiskLevel } from '../../data/readiness';
import { createAgendaTask } from '../../data/schema';

import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import MetricCard from '../../components/shared/MetricCard';

import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { subjects, categories, topics, settings, gameState, addXP } = useApp();

  const { items: exercises } = useCollection('exercises');
  const { items: sessions } = useCollection('sessions');
  const { items: grades } = useCollection('grades');
  const { items: agendaTasks, add: addTask, update: updateTask, remove: removeTask } = useCollection('agenda');

  const countdown = useCountdown(settings.exam_date);

  const [newTaskText, setNewTaskText] = useState('');

  // --- Readiness ---
  const readiness = useMemo(
    () => calculateReadiness(subjects, topics, exercises, grades, categories),
    [subjects, topics, exercises, grades, categories],
  );

  // --- Study hours this week ---
  const studyHoursThisWeek = useMemo(() => {
    const weekAgo = subDays(new Date(), 7).toISOString().split('T')[0];
    const recentSessions = sessions.filter((s) => s.date >= weekAgo);
    const totalMin = recentSessions.reduce((sum, s) => sum + (s.duration_min || 0), 0);
    return Math.round((totalMin / 60) * 10) / 10;
  }, [sessions]);

  // --- Today's agenda ---
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');
  const todayTasks = useMemo(
    () => agendaTasks.filter((t) => t.date === today),
    [agendaTasks, today],
  );

  // --- Subject cards sorted by risk ---
  const subjectCards = useMemo(() => {
    return subjects
      .map((subj) => {
        const stats = readiness.perSubject[subj.id] || {
          readiness: 0,
          gradeAvg: 0,
          gap: subj.target_grade || 7,
        };
        return { ...subj, stats, risk: getRiskLevel(stats.gap) };
      })
      .sort((a, b) => b.stats.gap - a.stats.gap);
  }, [subjects, readiness]);

  // --- Momentum indicator (placeholder: compare readiness to a simple heuristic) ---
  const momentumUp = readiness.momentum >= 0;

  // --- Handlers ---
  function handleAddTask(e) {
    e.preventDefault();
    const text = newTaskText.trim();
    if (!text) return;
    const task = createAgendaTask({ text, date: today });
    addTask(task);
    setNewTaskText('');
    addXP(2);
    toast.success('Task added');
  }

  function handleToggleTask(task) {
    updateTask(task.id, { completed: !task.completed });
    if (!task.completed) {
      addXP(5);
    }
  }

  function handleRemoveTask(id) {
    removeTask(id);
  }

  // --- Readiness colour ---
  function readinessColour(pct) {
    if (pct >= 70) return 'var(--colour-success)';
    if (pct >= 40) return 'var(--colour-warning)';
    return 'var(--colour-error)';
  }

  return (
    <div className="dashboard">

      {/* ===== 1. Today's Agenda ===== */}
      <Card className="agenda">
        <div className="agenda__header">
          <span className="agenda__date">{todayFormatted}</span>
        </div>

        {todayTasks.length === 0 && (
          <p className="agenda__empty">No tasks for today — add one below.</p>
        )}

        <ul className="agenda__list">
          {todayTasks.map((task) => (
            <li
              key={task.id}
              className={`agenda__item ${task.completed ? 'agenda__item--done' : ''}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task)}
                aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
              />
              {task.urgent && <span className="agenda__item-urgent" title="Urgent">&#9888;</span>}
              <span className="agenda__item-text">{task.text}</span>
              <button
                className="agenda__item-delete"
                onClick={() => handleRemoveTask(task.id)}
                title="Remove task"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>

        <form className="agenda__add-form" onSubmit={handleAddTask}>
          <input
            className="agenda__add-input"
            type="text"
            placeholder="+ Add task"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
          />
          <Button variant="secondary" size="sm" type="submit">
            Add
          </Button>
        </form>
      </Card>

      {/* ===== 2. Readiness Bar ===== */}
      <Card className="readiness">
        <div className="readiness__label">Overall Readiness</div>
        <div className="readiness__value" style={{ color: readinessColour(readiness.overall) }}>
          {readiness.overall}%
        </div>
        <div className="readiness__bar-wrapper">
          <ProgressBar
            value={readiness.overall}
            max={100}
            height={44}
            colour={readinessColour(readiness.overall)}
            showLabel
          />
        </div>
        <div className="readiness__meta">
          <span className={momentumUp ? 'readiness__momentum--up' : 'readiness__momentum--down'}>
            {momentumUp ? '▲' : '▼'} vs last week
          </span>
          <span>
            Gap to 100%: <strong>{100 - readiness.overall}pp</strong>
          </span>
        </div>
      </Card>

      {/* ===== 3. Subject Risk Cards ===== */}
      {subjectCards.length > 0 && (
        <section>
          <h2 className="dashboard__section-title">Subjects by Risk</h2>
          <div className="risk-grid">
            {subjectCards.map((subj) => {
              const gapClass =
                subj.stats.gap >= 3
                  ? 'risk-card__gap--high'
                  : subj.stats.gap >= 1.5
                    ? 'risk-card__gap--medium'
                    : '';
              return (
                <Card
                  key={subj.id}
                  className="risk-card"
                  colour={subj.colour}
                  onClick={() => navigate('/subjects')}
                >
                  <div className="risk-card__header">
                    <span className="risk-card__name">{subj.name}</span>
                    <span className="risk-card__badge" title={subj.risk.label}>
                      {subj.risk.emoji}
                    </span>
                  </div>
                  <div className="risk-card__stats">
                    <span>Avg: <strong>{subj.stats.gradeAvg || '—'}</strong></span>
                    <span className={`risk-card__gap ${gapClass}`}>
                      Gap: {subj.stats.gap > 0 ? `−${subj.stats.gap}` : 'none'}
                    </span>
                  </div>
                  <ProgressBar
                    value={subj.stats.readiness}
                    max={100}
                    height={8}
                    colour={subj.colour}
                  />
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== 4. Time Tracking Widget ===== */}
      <MetricCard
        label="Study Hours This Week"
        value={studyHoursThisWeek}
        unit="h"
        arrow={studyHoursThisWeek >= 10 ? '▲' : '▼'}
        good={studyHoursThisWeek >= 10}
      />

      {/* ===== 5. Countdown ===== */}
      <div className="countdown">
        <div className="countdown__days">
          {countdown.formatted} &middot; {countdown.dateLabel}
        </div>
      </div>

      {/* ===== 6. Gamification Summary ===== */}
      {settings.gamification_enabled && (
        <Card>
          <div className="gamification-summary">
            <div className="gamification-summary__item">
              🔥 Streak:
              <span className="gamification-summary__value">
                {gameState.streak_days}d
              </span>
            </div>
            <div className="gamification-summary__item">
              📄 Pagine:
              <span className="gamification-summary__value">
                {gameState.pagine}
              </span>
            </div>
            <div className="gamification-summary__item">
              🏅 Last badge:
              <span className="gamification-summary__value">
                {gameState.capitoli?.length > 0
                  ? gameState.capitoli[gameState.capitoli.length - 1].name
                  : '—'}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
