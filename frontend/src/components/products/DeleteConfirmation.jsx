import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';

import Alert from '../common/Alert.jsx';
import Button from '../common/Button.jsx';
import './DeleteConfirmation.css';

/**
 * Props: open, productName, loading, error, onConfirm(), onCancel()
 */
function DeleteConfirmation({ open, productName, loading = false, error = '', onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const loadingRef = useRef(loading);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    loadingRef.current = loading;
    onCancelRef.current = onCancel;
  });

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus(); // start on the safe choice

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loadingRef.current) {
        onCancelRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      // Keep keyboard focus inside the dialog
      const focusable = dialogRef.current?.querySelectorAll('button:not([disabled])');
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="dc-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="dc"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dc-title"
        aria-describedby="dc-text"
      >
        <span className="dc__icon">
          <Trash2 size={26} aria-hidden="true" />
        </span>
        <h2 id="dc-title" className="dc__title">
          Delete this product?
        </h2>
        <p id="dc-text" className="dc__text">
          <strong>{productName}</strong> and any open requests for it will be permanently removed.
          This cannot be undone.
        </p>

        {error && <Alert type="error">{error}</Alert>}

        <div className="dc__actions">
          <button ref={cancelRef} type="button" className="dc__cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <Button onClick={onConfirm} loading={loading} className="dc__confirm">
            {loading ? 'Deleting...' : 'Yes, delete'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeleteConfirmation;