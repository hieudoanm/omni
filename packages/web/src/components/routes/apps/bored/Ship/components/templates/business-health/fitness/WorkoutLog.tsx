import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  weight?: string;
  rest?: string;
}

export const WorkoutLog: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Workout Log';
  const date = (data.date as string) ?? '';
  const exercises = (data.exercises as Exercise[]) ?? [
    { name: 'Bench Press', sets: '4', reps: '8', weight: '80kg', rest: '90s' },
    { name: 'Squat', sets: '5', reps: '5', weight: '100kg', rest: '120s' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-4'>
        <h1 className='text-base-content text-4xl font-bold'>{title}</h1>
        {date && <time className='text-neutral text-xs'>{date}</time>}
      </div>
      <div className='border-base-300 flex flex-1 flex-col overflow-hidden rounded border'>
        <div className='bg-primary/10 grid grid-cols-[1fr_3rem_3rem_4rem_3rem] gap-1 px-3 py-2'>
          <span className='text-primary text-xs font-bold'>EXERCISE</span>
          <span className='text-primary text-center text-xs font-bold'>SETS</span>
          <span className='text-primary text-center text-xs font-bold'>REPS</span>
          <span className='text-primary text-center text-xs font-bold'>WEIGHT</span>
          <span className='text-primary text-center text-xs font-bold'>REST</span>
        </div>
        {exercises.map((ex, i) => (
          <div
            key={i}
            className={`border-base-300 grid grid-cols-[1fr_3rem_3rem_4rem_3rem] gap-1 border-t px-3 py-2 ${i % 2 === 1 ? 'bg-base-200/50' : ''}`}>
            <span className='text-base-content text-xs font-medium'>{ex.name}</span>
            <span className='text-neutral text-center text-xs'>{ex.sets}</span>
            <span className='text-neutral text-center text-xs'>{ex.reps}</span>
            <span className='text-base-content text-center text-xs font-semibold'>
              {ex.weight ?? '—'}
            </span>
            <span className='text-neutral text-center text-xs'>{ex.rest ?? '—'}</span>
          </div>
        ))}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

WorkoutLog.displayName = 'WorkoutLog';
