import { FC, useState } from 'react';

import { ToastItem, ToastType } from '../types';

const TOAST_EMOJI: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  loading: '⌛',
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const show = (
    type: ToastType,
    message: string,
    duration = type === 'loading' ? undefined : 2500,
  ) => {
    const id = Date.now();
    setToasts((prev) => [
      ...prev.slice(-2),
      { id, type, message: `${TOAST_EMOJI[type]} ${message}`, duration },
    ]);
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  };
  return { toasts, show, dismiss };
};

export const ToastUI: FC<{
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}> = ({ toasts, onDismiss }) => (
  <div className='toast toast-bottom toast-end z-50 space-y-2'>
    {toasts.map((toast) => (
      <div
        key={toast.id}
        onClick={() => onDismiss(toast.id)}
        className={`alert animate-toast-in cursor-pointer transition-all duration-300 ease-out ${
          toast.type === 'success'
            ? 'alert-success'
            : toast.type === 'error'
              ? 'alert-error'
              : 'alert-info'
        }`}>
        <div className='flex items-center gap-2'>
          {toast.type === 'loading' && <span className='loading loading-spinner loading-sm' />}
          <span>{toast.message}</span>
        </div>
      </div>
    ))}
  </div>
);
ToastUI.displayName = 'ToastUI';
