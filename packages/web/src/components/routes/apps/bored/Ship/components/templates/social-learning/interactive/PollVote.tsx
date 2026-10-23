import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const PollVote: FC<TemplateProps> = ({ data }) => {
  const question = (data.question as string) ?? '';
  const options = (data.options as { label: string; percentage: number }[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-6 text-4xl leading-tight font-bold'>{question}</h1>
      <ul className='flex flex-1 flex-col justify-center gap-3'>
        {options.map((opt, i) => (
          <li key={i}>
            <div className='mb-2 flex items-center justify-between text-sm'>
              <span className='text-base-content font-medium'>{opt.label}</span>
              <span className='text-neutral'>{opt.percentage}%</span>
            </div>
            <div className='bg-neutral/20 h-2 w-full overflow-hidden rounded-full'>
              <div
                className='bg-accent h-full rounded-full transition-all'
                style={{ width: `${opt.percentage}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className='text-neutral mt-4 text-center text-sm'>Cast your vote</p>
      <Footer citation={citation} />
    </Background>
  );
};

PollVote.displayName = 'PollVote';
