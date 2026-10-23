import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const StreakCounter: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Learning Streak';
  const streak = (data.streak as string) ?? '42';
  const label = (data.label as string) ?? 'days';
  const started = (data.started as string) ?? 'Started Feb 15, 2025';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>{title}</h2>

      <div className='text-primary mt-4 text-3xl font-black'>{streak}</div>
      <span className='text-neutral mt-1 text-base font-medium'>{label}</span>

      <div className='bg-primary/10 mt-4 flex items-center gap-2 rounded-full px-4 py-2'>
        <span className='text-xs'>🔥</span>
        <span className='text-primary text-xs font-bold'>Active Streak</span>
      </div>

      <time className='text-neutral mt-5 text-xs'>{started}</time>
      <Footer citation={citation} />
    </Background>
  );
};

StreakCounter.displayName = 'StreakCounter';
