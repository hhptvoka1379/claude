import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ marginBottom: '20px', color: 'var(--colour-text-muted)' }}>{message}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
