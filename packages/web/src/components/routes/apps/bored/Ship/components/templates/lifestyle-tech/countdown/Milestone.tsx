import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Milestone: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Milestone';
  const milestone = (data.milestone as string) ?? '10K Followers';
  const current = (data.current as string) ?? '9,847';
  const target = (data.target as string) ?? '10,000';
  const text = (data.text as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='text-center'>
        <h2 className='text-neutral text-xs font-bold tracking-widest uppercase'>{title}</h2>
        <div className='text-primary mt-3 text-2xl font-black'>{milestone}</div>
        <div className='text-base-content mt-3 flex items-baseline justify-center gap-2'>
          <span className='text-primary text-2xl font-black'>{current}</span>
          <span className='text-neutral text-base font-medium'>/ {target}</span>
        </div>
        {text && <p className='text-neutral mt-3 text-sm'>{text}</p>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Milestone.displayName = 'Milestone';
