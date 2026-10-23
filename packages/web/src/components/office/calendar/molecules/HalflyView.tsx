import { FC } from 'react';
import {
  monthsShort,
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
} from '@/data/office/calendar/constants';

const buildWeeks = (year: number, monthIndex: number): (number | null)[][] => {
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
  return weeks;
};

export const HalflyView: FC<{ year: number; month: number }> = ({ year, month }) => {
  const halfStart = month < 6 ? 0 : 6;
  const halfMonths = Array.from({ length: 6 }, (_, i) => halfStart + i);
  const half = month < 6 ? 1 : 2;

  return (
    <div className='p-4'>
      <p className='text-base-content/50 mb-2 text-xs font-semibold'>H{half}</p>
      <div className='grid grid-cols-3 gap-4 md:grid-cols-6'>
        {halfMonths.map((monthIndex) => {
          const weeks = buildWeeks(year, monthIndex);
          return (
            <div key={monthIndex} className='flex flex-col gap-1'>
              <p className='text-primary text-xs font-semibold'>{monthsShort[monthIndex]}</p>
              <div className='grid grid-cols-7 gap-px'>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div
                    key={`${d}-${i}`}
                    className='text-base-content/30 py-0.5 text-center text-[9px]'>
                    {d}
                  </div>
                ))}
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
};
HalflyView.displayName = 'HalflyView';
