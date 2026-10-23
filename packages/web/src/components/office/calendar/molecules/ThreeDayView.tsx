import { FC } from 'react';
import { TimeGrid } from '@/components/office/calendar/atoms/TimeGrid';

interface ThreeDayViewProps {
  year: number;
  month: number;
  day: number;
}

export const ThreeDayView: FC<ThreeDayViewProps> = ({ year, month, day }) => {
  const dates = [0, 1, 2].map((offset) => new Date(year, month, day + offset));

  return (
    <div className='flex h-full flex-col'>
      <TimeGrid dates={dates} />
    </div>
  );
};
ThreeDayView.displayName = 'ThreeDayView';
