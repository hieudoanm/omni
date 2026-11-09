import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const MythVsFact: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const myth = (data.myth as string) ?? '';
  const fact = (data.fact as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='bg-accent/10 px-5 py-3'>
        <h1 className='text-base-content text-center text-4xl font-bold tracking-tight'>{title}</h1>
      </div>
      <div className='flex flex-1'>
        <div className='flex w-1/2 flex-col items-center justify-center gap-2 p-4'>
          <div className='bg-error/20 flex h-12 w-12 items-center justify-center rounded-full'>
            <svg
              className='text-error h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </div>
          <span className='bg-error/10 text-error rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase'>
            Myth
          </span>
          <p className='text-neutral text-center text-base leading-relaxed'>{myth}</p>
        </div>
        <div className='bg-accent/20 flex w-0.5 flex-shrink-0' />
        <div className='flex w-1/2 flex-col items-center justify-center gap-2 p-4'>
          <div className='bg-success/20 flex h-12 w-12 items-center justify-center rounded-full'>
            <svg
              className='text-success h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2.5}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
            </svg>
          </div>
          <span className='bg-success/10 text-success rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase'>
            Fact
          </span>
          <p className='text-neutral text-center text-base leading-relaxed'>{fact}</p>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

MythVsFact.displayName = 'MythVsFact';
