'use client';

import { type FC } from 'react';
import { FiCheckCircle, FiInfo, FiX, FiXCircle } from 'react-icons/fi';
import { useToast } from '@/components/office/keynotes/organisms/ToastProvider';

const ICONS = {
  success: FiCheckCircle,
  error: FiXCircle,
  info: FiInfo,
};

export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToast();
  return (
    <div className='fixed right-4 bottom-4 z-[100] flex flex-col gap-2'>
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={`bg-base-100 border-base-300 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              t.type === 'error' ? 'border-error/50' : ''
            }`}>
            <Icon
              className={`size-4 ${
                t.type === 'success'
                  ? 'text-success'
                  : t.type === 'error'
                    ? 'text-error'
                    : 'text-info'
              }`}
            />
            <span>{t.message}</span>
            <button
              type='button'
              aria-label='Dismiss'
              className='text-base-content/40 hover:text-base-content cursor-pointer'
              onClick={() => removeToast(t.id)}>
              <FiX className='size-3.5' />
            </button>
          </div>
        );
      })}
    </div>
  );
};
