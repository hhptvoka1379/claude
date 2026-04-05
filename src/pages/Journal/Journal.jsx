import { useState, useMemo } from 'react';
import { useCollection } from '../../hooks/useCollection';
import { createJournalEntry } from '../../data/schema';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import { format, parseISO } from 'date-fns';
import './Journal.css';

const MOODS = ['\u{1F61E}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F60A}'];
const ENERGY_LABELS = ['Exhausted', 'Low', 'Normal', 'Good', 'High'];
const SLEEP_LABELS = ['Terrible', 'Poor', 'Fair', 'Good', 'Great'];

export default function Journal() {
  const { items: entries, add, update } = useCollection('journal', []);
  const today = new Date().toISOString().split('T')[0];

  const sorted = useMemo(() =>
    [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  );

  const [selectedDate, setSelectedDate] = useState(today);

  const selectedEntry = useMemo(() =>
    entries.find(e => e.date === selectedDate),
    [entries, selectedDate]
  );

  function handleCreate() {
    if (!entries.find(e => e.date === selectedDate)) {
      add(createJournalEntry({ date: selectedDate }));
    }
  }

  function handleFieldChange(field, value) {
    if (selectedEntry) {
      update(selectedEntry.id, { [field]: value });
    }
  }

  function DotScale({ value, onChange, labels, count = 5 }) {
    return (
      <div className="dot-scale">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            className={`dot-scale__dot ${i < value ? 'dot-scale__dot--filled' : ''}`}
            onClick={() => onChange(i + 1)}
            title={labels?.[i] || `${i + 1}`}
          />
        ))}
        <span className="dot-scale__label text-xs text-muted">
          {labels?.[value - 1] || value}
        </span>
      </div>
    );
  }

  return (
    <div className="journal-page">
      <div className="page-header">
        <h1 className="page-title">Journal</h1>
        <p className="page-subtitle">A private space. No metrics, no judgment.</p>
      </div>

      <div className="two-panel">
        <div className="two-panel__left">
          <Card className="journal-list">
            {sorted.length === 0 ? (
              <EmptyState
                title="No entries yet"
                description="Start writing today"
                action={<Button onClick={handleCreate}>Write Today</Button>}
              />
            ) : (
              sorted.map(entry => (
                <div
                  key={entry.id}
                  className={`journal-list__item ${entry.date === selectedDate ? 'journal-list__item--selected' : ''}`}
                  onClick={() => setSelectedDate(entry.date)}
                >
                  <span className="journal-list__mood">{MOODS[entry.mood - 1] || '\u{1F610}'}</span>
                  <div className="journal-list__info">
                    <div className="journal-list__date">{format(parseISO(entry.date), 'EEEE, MMM d')}</div>
                    <div className="journal-list__preview text-xs text-muted">
                      {entry.text ? entry.text.slice(0, 60) + (entry.text.length > 60 ? '...' : '') : 'Empty entry'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        <div className="two-panel__right">
          {selectedEntry ? (
            <div className="journal-editor">
              <div className="journal-editor__header">
                <h2>{format(parseISO(selectedEntry.date), 'EEEE, MMMM d, yyyy')}</h2>
              </div>

              <div className="journal-scales">
                <div className="journal-scale">
                  <label className="form-label">Mood</label>
                  <div className="journal-scale__moods">
                    {MOODS.map((emoji, i) => (
                      <button
                        key={i}
                        className={`journal-mood-btn ${selectedEntry.mood === i + 1 ? 'journal-mood-btn--selected' : ''}`}
                        onClick={() => handleFieldChange('mood', i + 1)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="journal-scale">
                  <label className="form-label">Energy</label>
                  <DotScale value={selectedEntry.energy} onChange={v => handleFieldChange('energy', v)} labels={ENERGY_LABELS} />
                </div>
                <div className="journal-scale">
                  <label className="form-label">Sleep Quality</label>
                  <DotScale value={selectedEntry.sleep} onChange={v => handleFieldChange('sleep', v)} labels={SLEEP_LABELS} />
                </div>
              </div>

              <Textarea
                value={selectedEntry.text}
                onChange={e => handleFieldChange('text', e.target.value)}
                placeholder="How was your day? What did you study? How do you feel about the exam?"
                rows={12}
                className="journal-textarea"
              />
            </div>
          ) : (
            <EmptyState
              title="No entry for this day"
              description={`Start writing for ${format(parseISO(selectedDate), 'MMMM d')}`}
              action={<Button onClick={handleCreate}>Create Entry</Button>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
