import { useEffect } from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';

import './Toast.css';

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;

  // Remove itself after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`toast toast--${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      <Icon size={20} className="toast__icon" aria-hidden="true" />
      <p className="toast__message">{toast.message}</p>
      <button
        type="button"
        className="toast__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default ToastContainer;