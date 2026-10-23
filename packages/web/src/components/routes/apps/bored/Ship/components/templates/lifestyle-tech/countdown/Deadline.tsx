import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Deadline: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Deadline';
  const daysLeft = (data.daysLeft as string) ?? '5';
  const task = (data.task as string) ?? 'Final submission';
  const text = (data.text as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='text-center'>
        <h2 className='text-neutral text-xs font-bold tracking-widest uppercase'>{title}</h2>
        <div className='text-primary mt-4 text-4xl leading-none font-black'>{daysLeft}</div>
        <div className='text-base-content mt-2 text-xs font-bold tracking-wider uppercase'>
          days left
        </div>
        <p className='text-neutral mt-3 text-base font-medium'>{task}</p>
        {text && <p className='text-neutral mt-2 text-xs'>{text}</p>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Deadline.displayName = 'Deadline';
