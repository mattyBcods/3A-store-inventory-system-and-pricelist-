import { useState } from 'react';
import Modal from './Modal.jsx';

export function DeleteDialog({ product, onConfirm, onClose, busy }) {
  const [error, setError] = useState('');
  async function confirm() {
    setError('');
    try {
      await onConfirm(product.id);
      onClose();
    } catch (failure) {
      setError(failure.message);
    }
  }
  return (
    <Modal id="deleteDialog" titleId="deleteTitle" onClose={onClose} locked={busy}>
      <h2 id="deleteTitle">Delete this product?</h2>
      <p>{product.name}</p>
      <p>This will permanently remove it from this browser's inventory.</p>
      <p className="error" role="alert">
        {error}
      </p>
      <div className="dialog-footer">
        <button className="secondary" onClick={onClose} disabled={busy}>
          Keep product
        </button>
        <button className="danger" onClick={confirm} disabled={busy}>
          {busy ? 'Deleting…' : 'Delete product'}
        </button>
      </div>
    </Modal>
  );
}
