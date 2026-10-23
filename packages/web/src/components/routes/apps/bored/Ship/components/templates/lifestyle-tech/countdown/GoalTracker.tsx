import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const GoalTracker: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Goal Tracker';
  const goal = (data.goal as string) ?? 'Ship 100 commits';
  const current = (data.current as number) ?? 73;
  const target = (data.target as number) ?? 100;
  const unit = (data.unit as string) ?? '';
  const text = (data.text as string) ?? '';

  const pct = Math.min(Math.round((current / (target || 1)) * 100), 100);

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='w-full max-w-[80%] text-center'>
        <h2 className='text-neutral text-xs font-bold tracking-widest uppercase'>{title}</h2>
        <div className='text-base-content mt-3 text-base font-bold'>{goal}</div>
        <div className='text-primary mt-2 text-2xl font-black'>{pct}%</div>
        <div className='bg-base-200 mt-3 h-3 w-full overflow-hidden rounded-full'>
          <div className='bg-primary h-full rounded-full' style={{ width: `${pct}%` }} />
        </div>
        <div className='text-neutral mt-2 text-xs font-medium'>
          {current}
          {unit} / {target}
          {unit}
        </div>
        {text && <p className='text-neutral mt-3 text-sm'>{text}</p>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

GoalTracker.displayName = 'GoalTracker';
