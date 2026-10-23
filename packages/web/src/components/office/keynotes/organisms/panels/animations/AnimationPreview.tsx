'use client';

import { type FC, useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import type { ObjectAnimation } from '@/types/keynotes/deck';
import { animationClass } from '@/lib/office/keynotes/animations';

export const AnimationPreview: FC<{ anim: ObjectAnimation | null }> = ({ anim }) => {
  const [run, setRun] = useState(0);
  const cls = anim ? animationClass(anim) : '';
  return (
    <div className='border-base-300 bg-base-200 flex items-center gap-2 rounded-xl border p-2'>
      <div className='bg-base-300/40 flex h-14 flex-1 items-center justify-center overflow-hidden rounded-lg'>
        <div
          key={run}
          className={cls}
          style={{
            animationDuration: anim ? `${anim.duration}ms` : undefined,
            animationDelay: anim ? `${anim.delay}ms` : undefined,
            animationIterationCount: anim?.type === 'emphasis' ? 'infinite' : '1',
          }}>
          <div className='bg-primary/70 h-6 w-14 rounded-md' />
        </div>
      </div>
      <button
        type='button'
        title='Play preview'
        onClick={() => setRun((r) => r + 1)}
        className='btn btn-circle btn-ghost btn-sm'>
        <FiPlay className='size-4' />
      </button>
    </div>
  );
};
