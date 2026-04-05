import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useCollection } from '../../hooks/useCollection';
import SubjectTree from './SubjectTree';
import TopicDetail from './TopicDetail';
import EmptyState from '../../components/ui/EmptyState';
import './Subjects.css';

export default function Subjects() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const {
    subjects, categories, topics,
    addSubject, updateSubject, removeSubject,
    addCategory, updateCategory, removeCategory,
    addTopic, updateTopic, removeTopic,
  } = useApp();

  const { items: exercises } = useCollection('exercises');
  const { items: grades } = useCollection('grades');

  const [selectedTopicId, setSelectedTopicId] = useState(topicId || null);

  const handleSelectTopic = (id) => {
    setSelectedTopicId(id);
    navigate(id ? `/subjects/${id}` : '/subjects', { replace: true });
  };

  return (
    <div className="two-panel">
      <div className="two-panel__left">
        <SubjectTree
          subjects={subjects}
          categories={categories}
          topics={topics}
          exercises={exercises}
          selectedTopicId={selectedTopicId}
          onSelectTopic={handleSelectTopic}
          addSubject={addSubject}
          updateSubject={updateSubject}
          removeSubject={removeSubject}
          addCategory={addCategory}
          updateCategory={updateCategory}
          removeCategory={removeCategory}
          addTopic={addTopic}
          removeTopic={removeTopic}
        />
      </div>
      <div className="two-panel__right">
        {selectedTopicId ? (
          <TopicDetail
            topicId={selectedTopicId}
            subjects={subjects}
            categories={categories}
            topics={topics}
            exercises={exercises}
            grades={grades}
            updateTopic={updateTopic}
            removeTopic={removeTopic}
            onSelectTopic={handleSelectTopic}
          />
        ) : (
          <EmptyState
            title="Select a topic from the tree"
            description="Choose a subject, expand its categories, and click on a topic to view its details."
          />
        )}
      </div>
    </div>
  );
}
