import { FC } from 'react';
import {
  DAY_SHORT,
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
} from '@/data/office/calendar/constants';
import type { Event } from '@/data/office/calendar/events';

interface MonthCalendarProps {
  year: number;
  month: number;
  chosenDate: Date;
  onDateSelect: (date: Date) => void;
  events: Event[];
}

export const MonthCalendar: FC<MonthCalendarProps> = ({
  year,
  month,
  chosenDate,
  onDateSelect,
  events,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = new Array(firstDay).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const hasEvents = (day: number): boolean =>
    events.some((e) => {
      const yearMatch = e.year === 0 || e.frequency === 'annual' || e.year === year;
      const monthMatch = e.month === 0 || e.month === month + 1;
      const dateMatch = e.date === 0 || e.date === day;
      return yearMatch && monthMatch && dateMatch;
    });

  const isChosen = (day: number): boolean =>
    chosenDate.getFullYear() === year &&
    chosenDate.getMonth() === month &&
    chosenDate.getDate() === day;

  return (
    <div className='flex h-full flex-col'>
      <div className='border-base-content/10 grid grid-cols-7 border-b'>
        {DAY_SHORT.map((d) => (
          <div
            key={d}
            className='text-base-content/50 py-2 text-center text-xs font-medium tracking-wide uppercase'>
            {d}
          </div>
        ))}
      </div>
      <div className='grid flex-1 grid-cols-7 grid-rows-[repeat(auto-fill,minmax(0,1fr))]'>
        {weeks.flat().map((day, index) => {
          const isCurrentDay = day !== null && isToday(year, month, day);
          const selected = day !== null && isChosen(day);
          return (
            <div key={index} className='border-base-content/10 border-r border-b p-1'>
              {day !== null && (
                <div className='flex flex-col items-end gap-0.5'>
                  <button
                    onClick={() => onDateSelect(new Date(year, month, day))}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                      isCurrentDay
                        ? 'bg-primary text-primary-content font-bold'
                        : selected
                          ? 'bg-base-content/10 text-base-content font-semibold'
                          : 'text-base-content hover:bg-base-200'
                    }`}>
                    {day}
                  </button>
                  {hasEvents(day) && <div className='bg-primary h-1 w-1 rounded-full' />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
MonthCalendar.displayName = 'MonthCalendar';
