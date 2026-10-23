import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const QandA: FC<TemplateProps> = ({ data }) => {
  const question = (data.question as string) ?? '';
  const answer = (data.answer as string) ?? '';
  const category = (data.category as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      {category && (
        <span className='text-accent text-sm font-bold tracking-[0.2em] uppercase'>{category}</span>
      )}
      <div className='rounded-box border-accent/20 border px-6 py-4'>
        <div className='mb-2 flex items-start gap-2'>
          <span className='text-accent flex-shrink-0 text-sm font-bold'>Q:</span>
          <p className='text-base-content text-sm font-semibold'>{question}</p>
        </div>
      </div>
      <div className='rounded-box bg-accent/5 px-6 py-4'>
        <div className='flex items-start gap-2'>
          <span className='text-base-content flex-shrink-0 text-sm font-bold'>A:</span>
          <p className='text-neutral text-sm leading-relaxed'>{answer}</p>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

QandA.displayName = 'QandA';
