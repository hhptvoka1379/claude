import { useState, useMemo } from 'react';
import { useCollection } from '../../hooks/useCollection';
import { createPrompt, PROMPT_CATEGORIES } from '../../data/schema';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
import { format, parseISO } from 'date-fns';
import './Prompts.css';

const CAT_COLOURS = {
  essay: '#6b4f3a', anki: '#3a6b7c', grammar: '#7c5c9a', review: '#4a7c59', other: '#8a7a6a',
};

export default function Prompts() {
  const { items: prompts, add, update, remove } = useCollection('prompts', []);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showResult, setShowResult] = useState(null);
  const [resultText, setResultText] = useState('');

  const filtered = useMemo(() => {
    let list = [...prompts];
    if (filter !== 'all') list = list.filter(p => p.category === filter);
    return list;
  }, [prompts, filter]);

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(prompt) {
    setEditing(prompt);
    setShowForm(true);
  }

  function handleSave(data) {
    if (editing) {
      const currentVersion = editing.versions[editing.versions.length - 1];
      const versions = data.text !== currentVersion.text
        ? [...editing.versions, { id: uuid(), text: data.text, created_at: new Date().toISOString() }]
        : editing.versions;
      update(editing.id, { title: data.title, category: data.category, versions });
      toast.success('Prompt updated');
    } else {
      add(createPrompt({
        title: data.title,
        category: data.category,
        versions: [{ id: uuid(), text: data.text, created_at: new Date().toISOString() }],
      }));
      toast.success('Prompt created');
    }
    setShowForm(false);
  }

  function handleDelete() {
    if (editing) {
      remove(editing.id);
      toast.success('Prompt deleted');
      setShowForm(false);
    }
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }

  function handleSaveResult(promptId) {
    if (!resultText.trim()) return;
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;
    const result = {
      id: uuid(),
      timestamp: new Date().toISOString(),
      content: resultText,
      version_id: prompt.versions[prompt.versions.length - 1].id,
    };
    update(promptId, {
      results: [...prompt.results, result],
      usage_count: prompt.usage_count + 1,
      last_used: new Date().toISOString().split('T')[0],
    });
    setResultText('');
    setShowResult(null);
    toast.success('Result saved');
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Prompt Library</h1>
          <p className="page-subtitle">Reusable prompts for your AI workflow</p>
        </div>
        <Button onClick={openNew}>+ New Prompt</Button>
      </div>

      <div className="filters-bar">
        {[{ value: 'all', label: 'All' }, ...PROMPT_CATEGORIES].map(cat => (
          <Button
            key={cat.value}
            variant={filter === cat.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No prompts yet"
          description="Create reusable prompts for essays, Anki cards, reviews, and more"
          action={<Button onClick={openNew}>+ New Prompt</Button>}
        />
      ) : (
        <div className="card-grid">
          {filtered.map(prompt => {
            const currentText = prompt.versions[prompt.versions.length - 1]?.text || '';
            return (
              <Card key={prompt.id} className="prompt-card">
                <div className="prompt-card__header">
                  <h3 className="prompt-card__title">{prompt.title}</h3>
                  <Badge colour={CAT_COLOURS[prompt.category]}>{prompt.category}</Badge>
                </div>

                <pre className="prompt-card__text">{currentText.slice(0, 200)}{currentText.length > 200 ? '...' : ''}</pre>

                <div className="prompt-card__meta text-xs text-muted">
                  <span>Used {prompt.usage_count}x</span>
                  {prompt.last_used && <span> · Last: {prompt.last_used}</span>}
                  <span> · {prompt.versions.length} version{prompt.versions.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="prompt-card__actions">
                  <Button size="sm" onClick={() => handleCopy(currentText)}>Copy</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setShowResult(prompt.id); setResultText(''); }}>
                    Paste Result
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(prompt)}>Edit</Button>
                </div>

                {prompt.results.length > 0 && (
                  <div className="prompt-card__results">
                    <div className="text-xs text-muted" style={{ marginBottom: '6px' }}>
                      Results ({prompt.results.length})
                    </div>
                    {prompt.results.slice(-2).reverse().map(r => (
                      <div key={r.id} className="prompt-result">
                        <div className="text-xs text-muted">{format(parseISO(r.timestamp), 'MMM d, HH:mm')}</div>
                        <div className="prompt-result__text">{r.content.slice(0, 100)}...</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit/Create form */}
      {showForm && (
        <PromptForm
          prompt={editing}
          onSave={handleSave}
          onDelete={editing ? handleDelete : null}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Paste result modal */}
      <Modal isOpen={!!showResult} onClose={() => setShowResult(null)} title="Paste AI Result">
        <Textarea
          label="Paste the result from your AI tool"
          value={resultText}
          onChange={e => setResultText(e.target.value)}
          rows={10}
        />
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setShowResult(null)}>Cancel</Button>
          <Button onClick={() => handleSaveResult(showResult)}>Save Result</Button>
        </div>
      </Modal>
    </div>
  );
}

function PromptForm({ prompt, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(prompt?.title || '');
  const [category, setCategory] = useState(prompt?.category || 'other');
  const [text, setText] = useState(prompt?.versions?.[prompt.versions.length - 1]?.text || '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      toast.error('Title and prompt text are required');
      return;
    }
    onSave({ title, category, text });
  }

  return (
    <Modal isOpen onClose={onClose} title={prompt ? 'Edit Prompt' : 'New Prompt'} wide>
      <form onSubmit={handleSubmit}>
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Essay Grader — Tipo B" />
        <Select label="Category" value={category} onChange={e => setCategory(e.target.value)} options={PROMPT_CATEGORIES} />
        <Textarea label="Prompt Text" value={text} onChange={e => setText(e.target.value)} rows={10} placeholder="Write your prompt here..." />

        {prompt && prompt.versions.length > 1 && (
          <div style={{ marginTop: '12px' }}>
            <div className="text-xs text-muted">Version history ({prompt.versions.length} versions)</div>
            {prompt.versions.map((v, i) => (
              <div key={v.id} className="text-xs text-muted" style={{ padding: '4px 0' }}>
                v{i + 1} — {format(parseISO(v.created_at), 'MMM d, yyyy HH:mm')}
                {i === prompt.versions.length - 1 && ' (current)'}
              </div>
            ))}
          </div>
        )}

        <div className="form-actions">
          {onDelete && <Button variant="danger" type="button" onClick={onDelete}>Delete</Button>}
          <div style={{ flex: 1 }} />
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{prompt ? 'Save Changes' : 'Create Prompt'}</Button>
        </div>
      </form>
    </Modal>
  );
}
