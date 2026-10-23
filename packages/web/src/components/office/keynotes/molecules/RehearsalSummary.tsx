'use client';

import { type FC } from 'react';
import { FiX } from 'react-icons/fi';
import { averageTime, pace, PACE_LABEL, PACE_NOTE } from '@/lib/office/keynotes/rehearsal';
import { formatDuration } from '@/lib/office/keynotes/format';

export const RehearsalSummary: FC<{
  slideNames: string[];
  times: Record<number, number>;
  total: number;
  onClose: () => void;
}> = ({ slideNames, times, total, onClose }) => {
  const list = slideNames.map((name, i) => ({ name, seconds: times[i] ?? 0 }));
  const avg = averageTime(list.map((l) => l.seconds));

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
      onClick={onClose}>
      <div
        className='bg-base-100 flex max-h-[80vh] w-[520px] flex-col rounded-2xl p-4 shadow-2xl'
        onClick={(e) => e.stopPropagation()}>
        <div className='mb-2 flex items-center justify-between'>
          <div className='text-sm font-semibold'>Rehearsal summary</div>
          <button
            type='button'
            aria-label='Close'
            onClick={onClose}
            className='opacity-60 hover:opacity-100'>
            <FiX className='size-4' />
          </button>
        </div>
        <div className='bg-base-200 mb-3 flex justify-between rounded-lg px-3 py-2 text-sm'>
          <span>
            Total: <b>{formatDuration(total)}</b>
          </span>
          <span>
            Average per slide: <b>{formatDuration(avg)}</b>
          </span>
        </div>
        <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto'>
          {list.map((item, i) => {
            const p = pace(item.seconds);
            return (
              <div
                key={i}
                className='border-base-300 flex items-center justify-between border-b py-1.5 text-xs'>
                <span className='w-6 opacity-50'>{i + 1}</span>
                <span className='min-w-0 flex-1 truncate'>{item.name}</span>
                <span className='tabular-nums opacity-70'>{formatDuration(item.seconds)}</span>
                <span
                  className={`ml-2 w-24 text-right ${p === 'slow' ? 'text-error' : p === 'fast' ? 'text-success' : ''}`}>
                  {PACE_LABEL[p]}
                </span>
                <span className='sr-only'>{PACE_NOTE[p]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
