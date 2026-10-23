import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const EventTimer: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Event Timer';
  const eventName = (data.eventName as string) ?? 'Annual Conference';
  const timeLeft = (data.timeLeft as string) ?? '3d 12h 45m';
  const date = (data.date as string) ?? 'Mar 15, 2025';
  const text = (data.text as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='text-center'>
        <h2 className='text-neutral text-xs font-bold tracking-widest uppercase'>{title}</h2>
        <div className='text-primary mt-3 text-xl font-black'>{timeLeft}</div>
        <div className='text-base-content mt-2 text-base font-bold'>{eventName}</div>
        <time className='text-neutral mt-1 text-xs'>{date}</time>
        {text && <p className='text-neutral mt-3 text-sm'>{text}</p>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

EventTimer.displayName = 'EventTimer';
