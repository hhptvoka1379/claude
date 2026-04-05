import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import { createExercise } from '../../data/schema';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import MetricCard from '../../components/shared/MetricCard';

import ExerciseCard from './ExerciseCard';
import ExerciseForm from './ExerciseForm';
import './Exercises.css';

export default function Exercises() {
  const { subjects, categories, topics } = useApp();
  const { items: exercises, add, update, remove } = useCollection('exercises');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [searchText, setSearchText] = useState('');

  // --- Metrics ---
  const metrics = useMemo(() => {
    if (exercises.length === 0) return { perSession: 0, minPerExercise: 0 };

    // Group by date to approximate "sessions"
    const byDate = {};
    exercises.forEach((ex) => {
      if (!byDate[ex.date]) byDate[ex.date] = [];
      byDate[ex.date].push(ex);
    });
    const sessionCount = Object.keys(byDate).length;
    const perSession = sessionCount > 0 ? (exercises.length / sessionCount).toFixed(1) : 0;

    const withDuration = exercises.filter((e) => e.duration_min != null && e.duration_min > 0);
    const totalMin = withDuration.reduce((s, e) => s + e.duration_min, 0);
    const minPerExercise = withDuration.length > 0
      ? (totalMin / withDuration.length).toFixed(1)
      : 0;

    return { perSession, minPerExercise };
  }, [exercises]);

  // --- Filtering ---
  const filtered = useMemo(() => {
    let result = [...exercises];

    if (filterSubject !== 'all') {
      const subjectCats = categories.filter((c) => c.subject_id === filterSubject);
      const subjectTopicIds = new Set(
        subjectCats.flatMap((cat) =>
          topics.filter((t) => t.category_id === cat.id).map((t) => t.id),
        ),
      );
      result = result.filter((ex) =>
        (ex.topic_ids || []).some((tid) => subjectTopicIds.has(tid)),
      );
    }

    if (filterOutcome !== 'all') {
      result = result.filter((ex) => ex.outcome === filterOutcome);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (ex) =>
          (ex.title || '').toLowerCase().includes(q) ||
          (ex.notes || '').toLowerCase().includes(q),
      );
    }

    // Sort by date descending
    result.sort((a, b) => b.date.localeCompare(a.date));
    return result;
  }, [exercises, filterSubject, filterOutcome, searchText, categories, topics]);

  // --- Subject options ---
  const subjectOptions = [
    { value: 'all', label: 'All subjects' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  const outcomeOptions = [
    { value: 'all', label: 'All outcomes' },
    { value: 'correct', label: 'Correct' },
    { value: 'incorrect', label: 'Incorrect' },
    { value: 'partial', label: 'Partial' },
  ];

  // --- Handlers ---
  function handleNewExercise() {
    setEditingExercise(createExercise());
    setModalOpen(true);
  }

  function handleEditExercise(ex) {
    setEditingExercise({ ...ex });
    setModalOpen(true);
  }

  function handleSave(data) {
    const existing = exercises.find((e) => e.id === data.id);
    if (existing) {
      update(data.id, data);
      toast.success('Exercise updated');
    } else {
      add(data);
      toast.success('Exercise added');
    }
    setModalOpen(false);
    setEditingExercise(null);
  }

  function handleDelete(id) {
    remove(id);
    toast.success('Exercise deleted');
    setModalOpen(false);
    setEditingExercise(null);
  }

  return (
    <div className="exercises-page">
      <div className="exercises-page__header">
        <h1>Exercises</h1>
        <Button onClick={handleNewExercise}>+ New Exercise</Button>
      </div>

      <div className="exercises-page__metrics">
        <MetricCard
          label="Exercises / session"
          value={metrics.perSession}
          arrow="▲"
          good={Number(metrics.perSession) >= 3}
        />
        <MetricCard
          label="Minutes / exercise"
          value={metrics.minPerExercise}
          unit="min"
          arrow="▼"
          good={Number(metrics.minPerExercise) <= 15}
        />
      </div>

      <div className="exercises-filters">
        <Select
          id="filter-subject"
          options={subjectOptions}
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        />
        <Select
          id="filter-outcome"
          options={outcomeOptions}
          value={filterOutcome}
          onChange={(e) => setFilterOutcome(e.target.value)}
        />
        <Input
          id="filter-search"
          className="exercises-filters__search"
          placeholder="Search exercises..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No exercises yet"
          description="Track your practice exercises to measure progress over time."
          action={<Button onClick={handleNewExercise}>+ New Exercise</Button>}
        />
      ) : (
        <div className="exercises-grid">
          {filtered.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              subjects={subjects}
              categories={categories}
              topics={topics}
              onClick={() => handleEditExercise(ex)}
            />
          ))}
        </div>
      )}

      <ExerciseForm
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExercise(null); }}
        exercise={editingExercise}
        subjects={subjects}
        categories={categories}
        topics={topics}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
