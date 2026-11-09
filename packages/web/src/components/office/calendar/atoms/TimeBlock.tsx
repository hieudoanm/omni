import { FC } from 'react';
import { TimeBlock as TimeBlockType } from '@/data/office/calendar/timeBlocks';

const HOUR_HEIGHT = 56;

interface TimeBlockProps {
  block: TimeBlockType;
  currentHour: number;
  isActive: boolean;
}

export const TimeBlock: FC<TimeBlockProps> = ({ block, currentHour, isActive }) => {
  const hours = block.end - block.start;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${block.start * HOUR_HEIGHT}px`,
        height: `${hours * HOUR_HEIGHT}px`,
        left: 0,
        right: 0,
      }}
      className={`flex items-center gap-2 rounded-lg border px-3 transition-all duration-300 ${
        isActive
          ? 'bg-base-content/20 border-base-content/40 shadow-sm'
          : 'bg-base-content/10 border-base-content/20 opacity-80'
      }`}>
      <span
        className={`shrink-0 font-mono text-[10px] tabular-nums ${isActive ? 'opacity-80' : 'opacity-50'}`}>
        {String(block.start).padStart(2, '0')}–{String(block.end).padStart(2, '0')}
      </span>

      <span className={`flex-1 text-xs font-normal ${isActive ? 'opacity-100' : 'opacity-60'}`}>
        {block.label}
      </span>

      <span
        className={`shrink-0 font-mono text-[10px] tabular-nums ${isActive ? 'opacity-60' : 'opacity-30'}`}>
        {hours}h
      </span>

      {isActive && (
        <div className='bg-base-content/10 absolute right-2 bottom-1.5 left-2 h-0.5 overflow-hidden rounded-full'>
          <div
            className='bg-base-content/40 h-full rounded-full transition-all duration-1000'
            style={{
              width: `${(((currentHour - block.start) / hours) * 100).toFixed(1)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};
TimeBlock.displayName = 'TimeBlock';
