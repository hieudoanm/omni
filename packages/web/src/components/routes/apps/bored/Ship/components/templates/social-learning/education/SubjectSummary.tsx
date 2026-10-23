import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const SubjectSummary: FC<TemplateProps> = ({ data }) => {
  const subject = (data.subject as string) ?? '';
  const topic = (data.topic as string) ?? '';
  const keyPoints = (data.keyPoints as string[]) ?? [];
  const summary = (data.summary as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 flex items-center gap-2'>
        <span className='text-accent text-sm font-bold tracking-[0.2em] uppercase'>{subject}</span>
        <span className='text-neutral/30'>/</span>
        <span className='text-neutral text-sm font-medium'>{topic}</span>
      </div>
      <ul className='mt-4 flex flex-col gap-3'>
        {keyPoints.map((point, i) => (
          <li key={i} className='flex items-start gap-3'>
            <svg
              className='text-accent mt-2 h-4 w-4 flex-shrink-0'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 12l2 2 4-4' />
            </svg>
            <p className='text-base-content text-sm'>{point}</p>
          </li>
        ))}
      </ul>
      {summary && (
        <div className='border-accent/20 mt-6 border-t pt-4'>
          <p className='text-neutral text-sm leading-relaxed'>{summary}</p>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

SubjectSummary.displayName = 'SubjectSummary';
