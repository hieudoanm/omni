import { FC } from 'react';
import {
  monthsShort,
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
} from '@/data/office/calendar/constants';

export const YearlyView: FC<{ year: number }> = ({ year }) => (
  <div className='p-4'>
    <div className='grid grid-cols-3 grid-rows-4 gap-4 md:grid-cols-4 md:grid-rows-3'>
      {monthsShort.map((month, monthIndex) => {
        const daysInMonth = getDaysInMonth(year, monthIndex);
        const firstDay = getFirstDayOfMonth(year, monthIndex);
        const weeks: (number | null)[][] = [];
        let currentWeek: (number | null)[] = new Array(firstDay).fill(null);
        for (let d = 1; d <= daysInMonth; d++) {
          currentWeek.push(d);
          if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
          }
        }
        if (currentWeek.length > 0) {
          while (currentWeek.length < 7) currentWeek.push(null);
          weeks.push(currentWeek);
        }

        return (
          <div key={month} className='flex flex-col gap-1'>
            <p className='text-xs font-semibold'>{month}</p>
            <div className='grid grid-cols-7 gap-px'>
              {weeks.flat().map((day, index) => {
                const today = day !== null && isToday(year, monthIndex, day);
                return (
                  <div key={index} className='flex justify-center py-0.5'>
                    {day !== null && (
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                          today
                            ? 'bg-primary text-primary-content font-bold'
                            : 'text-base-content/70'
                        }`}>
                        {day}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
YearlyView.displayName = 'YearlyView';
