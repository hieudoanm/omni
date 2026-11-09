import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const SpeedRun: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Speed Run';
  const task = (data.task as string) ?? 'Build a landing page';
  const record = (data.record as string) ?? '2h 15m';
  const attempts = (data.attempts as string) ?? '12';
  const text = (data.text as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='text-center'>
        <h2 className='text-neutral text-xs font-bold tracking-widest uppercase'>{title}</h2>
        <p className='text-base-content mt-3 text-lg font-bold'>{task}</p>
        <div className='text-primary mt-4 text-3xl leading-none font-black'>{record}</div>
        <div className='text-neutral mt-2 text-xs font-bold tracking-wider uppercase'>
          best time
        </div>
        <div className='text-neutral mt-2 text-xs'>{attempts} attempts</div>
        {text && <p className='text-neutral mt-3 text-sm'>{text}</p>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

SpeedRun.displayName = 'SpeedRun';
