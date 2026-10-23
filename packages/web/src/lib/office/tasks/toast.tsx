'use client';

import {
  type FC,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  createContext,
  useContext,
} from 'react';

export type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}
const ToastContext = createContext<ToastContextType | null>(null);
export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);
  return (
    <div
      className={`alert ${toast.type === 'success' ? 'alert-success' : toast.type === 'error' ? 'alert-error' : 'alert-info'} text-sm`}>
      <span>{toast.message}</span>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const removeToast = useCallback((id: string) => {
    setToasts((p) => p.filter((x) => x.id !== id));
  }, []);
  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((p) => [...p, { id, message, type }]);
  }, []);
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className='toast toast-end fixed right-4 bottom-4 z-50'>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
