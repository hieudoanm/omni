import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const StudyTips: FC<TemplateProps> = ({ data }) => {
  const technique = (data.technique as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const steps = (data.steps as string[]) ?? [];
  const subject = (data.subject as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      {subject && (
        <span className='text-accent mb-4 text-sm font-bold tracking-[0.2em] uppercase'>
          {subject}
        </span>
      )}
      <h1 className='text-base-content text-4xl leading-tight font-bold'>{technique}</h1>
      <p className='text-neutral mt-2 text-sm leading-relaxed'>{subtitle}</p>
      <ol className='mt-6 flex flex-col gap-3'>
        {steps.map((step, i) => (
          <li key={i} className='flex items-start gap-4'>
            <span className='text-accent mt-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold'>
              {i + 1}
            </span>
            <p className='text-base-content text-sm'>{step}</p>
          </li>
        ))}
      </ol>
      <Footer citation={citation} />
    </Background>
  );
};

StudyTips.displayName = 'StudyTips';
