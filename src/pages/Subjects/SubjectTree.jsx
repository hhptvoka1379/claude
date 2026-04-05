import { useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { createSubject, createCategory, createTopic } from '../../data/schema';
import toast from 'react-hot-toast';

const SUBJECT_COLOURS = [
  '#c05050', '#c07a30', '#6b4f3a', '#4a7c59',
  '#3a6b7c', '#7c5c9a', '#4a7a6b', '#7c6b3a',
];

export default function SubjectTree({
  subjects,
  categories,
  topics,
  exercises,
  selectedTopicId,
  onSelectTopic,
  addSubject,
  updateSubject,
  removeSubject,
  addCategory,
  updateCategory,
  removeCategory,
  addTopic,
  removeTopic,
}) {
  const [expandedSubjects, setExpandedSubjects] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Modal state
  const [modal, setModal] = useState({ type: null, parentId: null });
  const [formName, setFormName] = useState('');
  const [formColour, setFormColour] = useState(SUBJECT_COLOURS[0]);

  const toggleSubject = useCallback((id) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleCategory = useCallback((id) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openModal = (type, parentId = null) => {
    setModal({ type, parentId });
    setFormName('');
    setFormColour(SUBJECT_COLOURS[subjects.length % SUBJECT_COLOURS.length]);
  };

  const closeModal = () => {
    setModal({ type: null, parentId: null });
    setFormName('');
  };

  const handleSubmit = () => {
    const name = formName.trim();
    if (!name) {
      toast.error('Name is required');
      return;
    }

    if (modal.type === 'subject') {
      const subj = createSubject({ name, colour: formColour });
      addSubject(subj);
      toast.success(`Added subject "${name}"`);
    } else if (modal.type === 'category') {
      const cat = createCategory({ name, subject_id: modal.parentId });
      addCategory(cat);
      setExpandedSubjects((prev) => new Set(prev).add(modal.parentId));
      toast.success(`Added category "${name}"`);
    } else if (modal.type === 'topic') {
      const top = createTopic({ name, category_id: modal.parentId });
      addTopic(top);
      setExpandedCategories((prev) => new Set(prev).add(modal.parentId));
      toast.success(`Added topic "${name}"`);
    }

    closeModal();
  };

  const getCategoriesForSubject = (subjectId) =>
    categories.filter((c) => c.subject_id === subjectId);

  const getTopicsForCategory = (categoryId) =>
    topics.filter((t) => t.category_id === categoryId);

  const getExerciseCountForTopic = (topicId) =>
    exercises.filter((e) => e.topic_ids && e.topic_ids.includes(topicId)).length;

  const getSubjectProgress = (subjectId) => {
    const cats = getCategoriesForSubject(subjectId);
    const subjectTopics = cats.flatMap((c) => getTopicsForCategory(c.id));
    if (subjectTopics.length === 0) return 0;
    const completed = subjectTopics.filter((t) => t.completed).length;
    return Math.round((completed / subjectTopics.length) * 100);
  };

  const getSubjectExerciseCount = (subjectId) => {
    const cats = getCategoriesForSubject(subjectId);
    const topicIds = cats.flatMap((c) => getTopicsForCategory(c.id)).map((t) => t.id);
    return exercises.filter(
      (e) => e.topic_ids && e.topic_ids.some((id) => topicIds.includes(id))
    ).length;
  };

  const modalTitle =
    modal.type === 'subject'
      ? 'New Subject'
      : modal.type === 'category'
        ? 'New Category'
        : 'New Topic';

  return (
    <Card className="subject-tree-card">
      <div className="subject-tree">
        <div className="tree-header">
          <h3>Subjects</h3>
          <button
            className="tree-add-btn"
            onClick={() => openModal('subject')}
            title="Add subject"
          >
            +
          </button>
        </div>

        {subjects.length === 0 && (
          <p style={{ color: 'var(--colour-text-muted)', fontSize: '0.85rem', padding: '0 var(--space-sm)' }}>
            No subjects yet. Add one to get started.
          </p>
        )}

        {subjects.map((subject) => {
          const isExpanded = expandedSubjects.has(subject.id);
          const subjectCats = getCategoriesForSubject(subject.id);
          const progress = getSubjectProgress(subject.id);
          const exerciseCount = getSubjectExerciseCount(subject.id);

          return (
            <div key={subject.id}>
              <div
                className="tree-item tree-item--subject"
                onClick={() => toggleSubject(subject.id)}
              >
                <span className={`tree-chevron ${isExpanded ? 'tree-chevron--expanded' : ''}`}>
                  &#9654;
                </span>
                <span className="tree-dot" style={{ background: subject.colour }} />
                <span style={{ flex: 1 }}>{subject.name}</span>
                <span className="tree-meta">
                  {progress > 0 && <span>{progress}%</span>}
                  {exerciseCount > 0 && (
                    <span style={{ opacity: 0.6 }}>{exerciseCount} ex</span>
                  )}
                </span>
                <button
                  className="tree-add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal('category', subject.id);
                  }}
                  title="Add category"
                >
                  +
                </button>
              </div>

              <div className={`tree-children ${isExpanded ? 'tree-children--expanded' : ''}`}>
                {subjectCats.map((cat) => {
                  const isCatExpanded = expandedCategories.has(cat.id);
                  const catTopics = getTopicsForCategory(cat.id);

                  return (
                    <div key={cat.id}>
                      <div
                        className="tree-item tree-item--category"
                        onClick={() => toggleCategory(cat.id)}
                      >
                        <span className={`tree-chevron ${isCatExpanded ? 'tree-chevron--expanded' : ''}`}>
                          &#9654;
                        </span>
                        <span style={{ flex: 1 }}>{cat.name}</span>
                        <span className="tree-meta">{catTopics.length} topics</span>
                        <button
                          className="tree-add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('topic', cat.id);
                          }}
                          title="Add topic"
                        >
                          +
                        </button>
                      </div>

                      <div className={`tree-children ${isCatExpanded ? 'tree-children--expanded' : ''}`}>
                        {catTopics.map((topic) => {
                          const exCount = getExerciseCountForTopic(topic.id);
                          const isSelected = selectedTopicId === topic.id;

                          return (
                            <div
                              key={topic.id}
                              className={`tree-item tree-item--topic ${isSelected ? 'tree-item--selected' : ''}`}
                              onClick={() => onSelectTopic(topic.id)}
                            >
                              <span style={{ width: 18 }} />
                              <span style={{
                                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                background: topic.completed ? 'var(--colour-success)' : 'var(--colour-border)',
                              }} />
                              <span style={{ flex: 1 }}>{topic.name}</span>
                              {exCount > 0 && (
                                <Badge
                                  colour={isSelected ? 'rgba(255,255,255,0.3)' : undefined}
                                  variant="outline"
                                >
                                  {exCount}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modal.type !== null} onClose={closeModal} title={modalTitle}>
        <div className="modal-form-row">
          <Input
            label="Name"
            id="tree-form-name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
        </div>

        {modal.type === 'subject' && (
          <div className="modal-form-row">
            <label className="form-label">Colour</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUBJECT_COLOURS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormColour(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c,
                    border: formColour === c ? '3px solid var(--colour-text)' : '2px solid transparent',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        )}

        <div className="modal-form-actions">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSubmit}>Add</Button>
        </div>
      </Modal>
    </Card>
  );
}
