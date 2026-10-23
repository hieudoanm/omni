import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const GameReview: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Game Title';
  const platform = (data.platform as string) ?? 'PC';
  const score = (data.score as string) ?? '8.5';
  const reviewer = (data.reviewer as string) ?? 'Anonymous';
  const pros = (data.pros as string[]) ?? ['Great graphics', 'Engaging story'];
  const cons = (data.cons as string[]) ?? ['Short campaign'];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 flex items-center justify-between'>
        <span className='bg-accent/10 text-accent rounded-full px-1.5 py-0.5 text-xs font-bold'>
          {platform}
        </span>
        <span className='text-primary text-3xl font-extrabold'>{score}</span>
      </div>
      <h1 className='text-base-content mb-0.5 text-4xl font-bold'>{title}</h1>
      <p className='text-neutral mb-2 text-xs'>Reviewed by {reviewer}</p>
      <div className='flex flex-1 gap-3'>
        <ul className='flex w-1/2 flex-col gap-1'>
          <li className='text-success text-xs font-bold tracking-widest uppercase'>Pros</li>
          {pros.map((item, i) => (
            <li key={i} className='text-base-content text-xs leading-relaxed'>
              {item}
            </li>
          ))}
        </ul>
        <div className='bg-accent/20 w-0.5 flex-shrink-0' />
        <ul className='flex w-1/2 flex-col gap-1'>
          <li className='text-error text-xs font-bold tracking-widest uppercase'>Cons</li>
          {cons.map((item, i) => (
            <li key={i} className='text-base-content text-xs leading-relaxed'>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

GameReview.displayName = 'GameReview';
