import { FC, useMemo } from 'react';
import { TimeBlock } from '@/components/office/calendar/atoms/TimeBlock';
import { TimeGrid } from '@/components/office/calendar/atoms/TimeGrid';
import { TIME_BLOCKS } from '@/data/office/calendar/timeBlocks';
import { HOURS } from '@/data/office/calendar/constants';

const HOUR_HEIGHT = 56;

interface DayViewProps {
  year: number;
  month: number;
  day: number;
}

export const DayView: FC<DayViewProps> = ({ year, month, day }) => {
  const date = new Date(year, month, day);
  const now = useMemo(() => new Date(), []);
  const currentHour = now.getHours() + now.getMinutes() / 60;

  const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;

  const activeBlock = isToday
    ? TIME_BLOCKS.find((b) => currentHour >= b.start && currentHour < b.end)
    : null;

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1 overflow-auto'>
        <div className='relative flex'>
          <div className='w-16 shrink-0'>
            {HOURS.map((hour) => (
              <div key={hour} className='border-base-content/10 h-14 border-b pr-2 text-right'>
                <span className='text-base-content/40 relative -top-2 text-[10px]'>
                  {new Date(0, 0, 0, hour).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    hour12: true,
                  })}
                </span>
              </div>
            ))}
          </div>
          <div className='border-base-content/10 relative flex-1 border-l'>
            {HOURS.map((hour) => (
              <div key={hour} className='border-base-content/10 h-14 border-b' />
            ))}
            {TIME_BLOCKS.map((block) => (
              <TimeBlock
                key={block.label}
                block={block}
                currentHour={currentHour}
                isActive={activeBlock?.label === block.label}
              />
            ))}
            {isToday && (
              <div
                className='bg-primary pointer-events-none absolute right-0 left-0 z-20 h-px'
                style={{
                  top: `${(currentHour * 60 + now.getMinutes()) * (HOUR_HEIGHT / 60)}px`,
                }}>
                <div className='bg-primary absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full' />
              </div>
            )}
          </div>
        </div>
      </div>

      {isToday && (
        <footer className='border-base-content/10 border-t px-4 py-4 text-center font-mono'>
          <p className='text-base-content/20 text-xs tracking-widest uppercase'>
            {activeBlock?.label ?? 'off schedule'} · {String(now.getHours()).padStart(2, '0')}:
            {String(now.getMinutes()).padStart(2, '0')}
          </p>
        </footer>
      )}
    </div>
  );
};
DayView.displayName = 'DayView';
