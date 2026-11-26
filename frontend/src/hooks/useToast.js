import { useContext } from 'react';

import { ToastContext } from '../context/toastContextInstance.js';

// Usage: const toast = useToast(); toast.success('Saved!'); toast.error('Oops'); toast.info('FYI');
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}