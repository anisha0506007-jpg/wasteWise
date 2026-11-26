import { useCallback, useMemo, useState } from 'react';

import ToastContainer from '../components/common/Toast.jsx';
import { ToastContext } from './toastContextInstance.js';

let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const add = useCallback((type, message, duration = 5000) => {
    const id = nextToastId++;
    // Keep at most 4 toasts on screen
    setToasts((current) => [...current.slice(-3), { id, type, message, duration }]);
  }, []);

  const api = useMemo(
    () => ({
      success: (message) => add('success', message),
      error: (message) => add('error', message, 7000),
      info: (message) => add('info', message),
    }),
    [add]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}