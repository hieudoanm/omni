import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const SavingsGoal: FC<TemplateProps> = ({ data }) => {
  const goal = (data.goal as string) ?? '';
  const target = (data.target as string) ?? '';
  const current = (data.current as string) ?? '';
  const deadline = (data.deadline as string) ?? '';
  const note = (data.note as string) ?? '';

  const currentNum = parseFloat(current.replace(/[^0-9.]/g, '')) || 0;
  const targetNum = parseFloat(target.replace(/[^0-9.]/g, '')) || 1;
  const pct = Math.min(100, Math.round((currentNum / targetNum) * 100));

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Savings Goal</span>
      <h1 className='text-base-content mt-3 text-4xl font-bold'>{goal}</h1>
      <div className='mt-6 w-full'>
        <div className='bg-base-300 h-3 w-full overflow-hidden rounded-full'>
          <div
            className='bg-accent h-full rounded-full transition-all'
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className='mt-2 flex justify-between text-xs'>
          <span className='text-neutral'>{current}</span>
          <span className='text-base-content font-semibold'>{target}</span>
        </div>
        <span className='text-accent mt-1 block text-sm font-bold'>{pct}%</span>
      </div>
      {deadline && (
        <p className='text-neutral mt-4 text-xs'>
          Reach by <time>{deadline}</time>
        </p>
      )}
      {note && <p className='text-neutral mt-2 text-xs'>{note}</p>}
      <Footer citation={citation} />
    </Background>
  );
};

SavingsGoal.displayName = 'SavingsGoal';
