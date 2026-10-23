import { FC } from 'react';
import { HOURS, formatHour, DAY_SHORT } from '@/data/office/calendar/constants';

interface TimeGridProps {
  dates: Date[];
  showDayHeader?: boolean;
}

export const TimeGrid: FC<TimeGridProps> = ({ dates, showDayHeader = true }) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const isDateToday = (date: Date): boolean =>
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return (
    <div className='flex h-full flex-col'>
      {showDayHeader && (
        <div className='border-base-content/10 flex border-b'>
          <div className='w-16 shrink-0' />
          {dates.map((date) => {
            const today = isDateToday(date);
            return (
              <div
                key={date.toISOString()}
                className='border-base-content/10 flex-1 border-l py-2 text-center'>
                <div className='text-base-content/50 text-xs'>{DAY_SHORT[date.getDay()]}</div>
                <div
                  className={`text-2xl font-light ${today ? 'text-primary' : 'text-base-content'}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className='flex-1 overflow-auto'>
        <div className='relative flex'>
          <div className='w-16 shrink-0'>
            {HOURS.map((hour) => (
              <div key={hour} className='border-base-content/10 h-14 border-b pr-2 text-right'>
                <span className='text-base-content/40 relative -top-2 text-[10px]'>
                  {formatHour(hour)}
                </span>
              </div>
            ))}
          </div>
          {dates.map((date) => {
            const today = isDateToday(date);
            return (
              <div
                key={date.toISOString()}
                className='border-base-content/10 relative flex-1 border-l'>
                {HOURS.map((hour) => (
                  <div key={hour} className='border-base-content/10 h-14 border-b' />
                ))}
                {today && (
                  <div
                    className='bg-primary pointer-events-none absolute right-0 left-0 z-10 h-px'
                    style={{
                      top: `${(currentHour * 60 + currentMinute) * (56 / 60)}px`,
                    }}>
                    <div className='bg-primary absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full' />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
TimeGrid.displayName = 'TimeGrid';
