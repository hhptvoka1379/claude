import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

import { useCollection } from '../../hooks/useCollection';
import { createEssay } from '../../data/schema';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import MetricCard from '../../components/shared/MetricCard';

import EssayCard from './EssayCard';
import EssayForm from './EssayForm';
import './Essays.css';

const TIPOS = ['A', 'B', 'C'];

const TIPO_COLOURS = {
  A: '#2563eb',
  B: '#9333ea',
  C: '#059669',
};

export default function Essays() {
  const { items: essays, add, update, remove } = useCollection('essays');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEssay, setEditingEssay] = useState(null);
  const [filterTipo, setFilterTipo] = useState('all');

  // --- Per-tipo summary metrics ---
  const tipoStats = useMemo(() => {
    return TIPOS.map((tipo) => {
      const group = essays.filter((e) => e.tipo === tipo);
      const count = group.length;

      const withGrade = group.filter((e) => e.grade != null);
      const avgGrade = withGrade.length > 0
        ? (withGrade.reduce((s, e) => s + e.grade, 0) / withGrade.length).toFixed(1)
        : '--';

      const withBoth = group.filter(
        (e) => e.word_count != null && e.duration_min != null && e.duration_min > 0,
      );
      const wordsPerHr = withBoth.length > 0
        ? Math.round(
            withBoth.reduce((s, e) => s + e.word_count, 0) /
            (withBoth.reduce((s, e) => s + e.duration_min, 0) / 60),
          )
        : '--';

      return { tipo, count, avgGrade, wordsPerHr };
    });
  }, [essays]);

  // --- Filtered list ---
  const filtered = useMemo(() => {
    let result = [...essays];
    if (filterTipo !== 'all') {
      result = result.filter((e) => e.tipo === filterTipo);
    }
    result.sort((a, b) => b.date.localeCompare(a.date));
    return result;
  }, [essays, filterTipo]);

  // --- Handlers ---
  function handleNewEssay() {
    setEditingEssay(createEssay());
    setModalOpen(true);
  }

  function handleEditEssay(essay) {
    setEditingEssay({ ...essay });
    setModalOpen(true);
  }

  function handleSave(data) {
    const existing = essays.find((e) => e.id === data.id);
    if (existing) {
      update(data.id, data);
      toast.success('Essay updated');
    } else {
      add(data);
      toast.success('Essay added');
    }
    setModalOpen(false);
    setEditingEssay(null);
  }

  function handleDelete(id) {
    remove(id);
    toast.success('Essay deleted');
    setModalOpen(false);
    setEditingEssay(null);
  }

  return (
    <div className="essays-page">
      <div className="essays-page__header">
        <h1>Essays &amp; Writing</h1>
        <Button onClick={handleNewEssay}>+ New Essay</Button>
      </div>

      <div className="essays-page__tipo-stats">
        {tipoStats.map((st) => (
          <Card key={st.tipo} className="essays-tipo-card" colour={TIPO_COLOURS[st.tipo]}>
            <div className="essays-tipo-card__letter" style={{ color: TIPO_COLOURS[st.tipo] }}>
              {st.tipo}
            </div>
            <div className="essays-tipo-card__details">
              <span>{st.count} essay{st.count !== 1 ? 's' : ''}</span>
              <span>Avg grade: {st.avgGrade}</span>
              <span>{st.wordsPerHr} words/hr</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="essays-filters">
        <button
          className={`essays-tab ${filterTipo === 'all' ? 'essays-tab--active' : ''}`}
          onClick={() => setFilterTipo('all')}
        >
          All
        </button>
        {TIPOS.map((tipo) => (
          <button
            key={tipo}
            className={`essays-tab ${filterTipo === tipo ? 'essays-tab--active' : ''}`}
            style={filterTipo === tipo ? { borderColor: TIPO_COLOURS[tipo], color: TIPO_COLOURS[tipo] } : {}}
            onClick={() => setFilterTipo(tipo)}
          >
            Tipo {tipo}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No essays yet"
          description="Track your essay practice across Tipo A, B, and C formats."
          action={<Button onClick={handleNewEssay}>+ New Essay</Button>}
        />
      ) : (
        <div className="essays-list">
          {filtered.map((essay) => (
            <EssayCard
              key={essay.id}
              essay={essay}
              onClick={() => handleEditEssay(essay)}
            />
          ))}
        </div>
      )}

      <EssayForm
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEssay(null); }}
        essay={editingEssay}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
