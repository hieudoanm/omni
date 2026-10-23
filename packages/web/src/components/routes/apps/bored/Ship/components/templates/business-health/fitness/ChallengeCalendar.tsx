import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const ChallengeCalendar: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const month = (data.month as string) ?? '';
  const days = (data.days as { day: string; activity: string }[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-base-content text-4xl font-bold'>{title}</h1>
        {month && (
          <span className='text-accent text-xs font-bold tracking-widest uppercase'>{month}</span>
        )}
      </div>
      <ol className='flex flex-1 flex-col gap-1.5 overflow-y-auto'>
        {days.map((d, i) => (
          <li key={i} className='rounded-box flex items-center gap-3 px-3 py-2 text-sm'>
            <time className='text-accent w-6 text-xs font-bold'>{d.day}</time>
            <p className='text-base-content text-xs'>{d.activity}</p>
          </li>
        ))}
      </ol>
      <Footer citation={citation} />
    </Background>
  );
};

ChallengeCalendar.displayName = 'ChallengeCalendar';
