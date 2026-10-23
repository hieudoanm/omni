import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const WorkoutCard: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const exercise = (data.exercise as string) ?? '';
  const reps = (data.reps as string) ?? '';
  const sets = (data.sets as string) ?? '';
  const rest = (data.rest as string) ?? '';
  const note = (data.note as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>{title}</span>
      <h1 className='text-base-content mt-4 text-4xl leading-tight font-bold'>{exercise}</h1>
      <div className='mt-6 flex gap-6'>
        <div className='text-center'>
          <span className='text-accent text-3xl font-bold'>
            <strong>{sets}</strong>
          </span>
          <p className='text-neutral text-xs'>Sets</p>
        </div>
        <div className='text-center'>
          <span className='text-accent text-3xl font-bold'>
            <strong>{reps}</strong>
          </span>
          <p className='text-neutral text-xs'>Reps</p>
        </div>
      </div>
      {rest && (
        <span className='rounded-box bg-base-300 text-neutral mt-4 px-3 py-1 text-xs'>
          Rest: {rest}
        </span>
      )}
      {note && <p className='text-neutral mt-4 text-xs'>{note}</p>}
      <Footer citation={citation} />
    </Background>
  );
};

WorkoutCard.displayName = 'WorkoutCard';
