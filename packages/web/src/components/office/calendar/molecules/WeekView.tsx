import { FC } from 'react';
import { TimeGrid } from '@/components/office/calendar/atoms/TimeGrid';

interface WeekViewProps {
  year: number;
  weekStart: Date;
}

export const WeekView: FC<WeekViewProps> = ({ weekStart }) => {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className='flex h-full flex-col'>
      <TimeGrid dates={dates} />
    </div>
  );
};
WeekView.displayName = 'WeekView';
