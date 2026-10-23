import { months } from '@/data/office/calendar/months';
import { FC } from 'react';

const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const LunarDate: FC<{
  chosenDate: Date;
  lunarDay: number | null;
  lunarMonth: number | null;
  lunarYear: number | null;
}> = ({ chosenDate, lunarDay, lunarMonth, lunarYear }) => (
  <div className='px-4 py-3'>
    <p className='text-base-content/40 mb-2 text-[10px] font-normal tracking-widest uppercase'>
      Lunar Date
    </p>
    <p className='text-base-content/70 text-xs'>
      {DAY_LONG[chosenDate.getDay()]}, {months[chosenDate.getMonth()].month} {chosenDate.getDate()},{' '}
      {chosenDate.getFullYear()}
    </p>
    {lunarDay !== null ? (
      <p className='text-primary mt-1 font-mono text-sm font-normal'>
        {lunarDay}/{lunarMonth}/{lunarYear}
      </p>
    ) : (
      <p className='text-base-content/30 mt-1 text-xs'>Unavailable</p>
    )}
  </div>
);
LunarDate.displayName = 'LunarDate';
