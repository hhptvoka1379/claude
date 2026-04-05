import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

import { useCollection } from '../../hooks/useCollection';
import { createPCTOActivity, PCTO_STATUSES } from '../../data/schema';

import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

import PCTOCard from './PCTOCard';
import PCTOForm from './PCTOForm';
import './PCTO.css';

const STATUS_ORDER = { pending: 0, in_progress: 1, awaiting_certification: 2, complete: 3 };

export default function PCTO() {
  const { items: activities, add, update, remove } = useCollection('pcto');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Pinned first, then sorted by status
  const sorted = useMemo(() => {
    const list = [...activities];
    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0);
    });
    return list;
  }, [activities]);

  function handleNew() {
    setEditingActivity(createPCTOActivity());
    setModalOpen(true);
  }

  function handleEdit(activity) {
    setEditingActivity({ ...activity });
    setModalOpen(true);
  }

  function handleSave(data) {
    const existing = activities.find((a) => a.id === data.id);
    if (existing) {
      update(data.id, data);
      toast.success('Activity updated');
    } else {
      add(data);
      toast.success('Activity added');
    }
    setModalOpen(false);
    setEditingActivity(null);
  }

  function handleDelete(id) {
    remove(id);
    toast.success('Activity deleted');
    setModalOpen(false);
    setEditingActivity(null);
  }

  return (
    <div className="pcto-page">
      <div className="pcto-page__header">
        <div>
          <h1>PCTO Activities</h1>
          <p className="pcto-page__subtitle">
            Percorsi per le Competenze Trasversali e l'Orientamento
          </p>
        </div>
        <Button onClick={handleNew}>+ New Activity</Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No PCTO activities yet"
          description="Track your PCTO hours, contacts, and certifications here."
          action={<Button onClick={handleNew}>+ New Activity</Button>}
        />
      ) : (
        <div className="pcto-grid">
          {sorted.map((activity) => (
            <PCTOCard
              key={activity.id}
              activity={activity}
              onClick={() => handleEdit(activity)}
            />
          ))}
        </div>
      )}

      <PCTOForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingActivity(null);
        }}
        activity={editingActivity}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
