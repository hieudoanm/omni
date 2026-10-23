'use client';

import { type FC } from 'react';
import { FiArrowDown, FiArrowUp } from 'react-icons/fi';
import type { SlideObject } from '@/types/keynotes/deck';

export const AnimationOrderList: FC<{
  objects: SlideObject[];
  onMove: (id: string, dir: 1 | -1) => void;
}> = ({ objects, onMove }) => {
  const animated = objects.filter((o) => o.animation).sort((a, b) => a.z - b.z);
  if (animated.length === 0) return null;

  const total = Math.max(
    1,
    ...animated.map((o) => (o.animation?.delay ?? 0) + (o.animation?.duration ?? 0)),
  );

  return (
    <div className='flex flex-col gap-2'>
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>
        Animation order
      </div>
      <ol className='flex flex-col gap-1'>
        {animated.map((o, i) => (
          <li key={o.id} className='flex items-center gap-1 text-sm'>
            <span className='w-3 text-right opacity-50'>{i + 1}.</span>
            <span className='min-w-0 flex-1 truncate'>{o.name}</span>
            <span className='text-[10px] opacity-50'>
              {o.animation?.type} · {o.animation?.effect}
            </span>
            <button
              type='button'
              disabled={i === 0}
              onClick={() => onMove(o.id, -1)}
              className='btn btn-ghost btn-xs disabled:opacity-20'
              title='Move earlier'>
              <FiArrowUp className='size-3' />
            </button>
            <button
              type='button'
              disabled={i === animated.length - 1}
              onClick={() => onMove(o.id, 1)}
              className='btn btn-ghost btn-xs disabled:opacity-20'
              title='Move later'>
              <FiArrowDown className='size-3' />
            </button>
          </li>
        ))}
      </ol>
      <div className='bg-base-200 relative h-6 overflow-hidden rounded-md'>
        {animated.map((o) => {
          const delay = o.animation?.delay ?? 0;
          const duration = o.animation?.duration ?? 0;
          return (
            <div
              key={o.id}
              className='bg-primary/50 absolute top-0 h-full rounded-sm'
              style={{
                left: `${(delay / total) * 100}%`,
                width: `${(duration / total) * 100}%`,
              }}
              title={`${o.name}: ${delay}ms + ${duration}ms`}
            />
          );
        })}
      </div>
    </div>
  );
};
