import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const LearningPath: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const steps = (data.steps as { level: string; label: string; desc?: string }[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-4 text-4xl leading-tight font-bold'>{title}</h1>
      <ol className='flex flex-col gap-0'>
        {steps.map((step, i) => (
          <li key={i} className='relative flex items-start gap-4 pb-4 last:pb-0'>
            <div className='flex flex-col items-center'>
              <span className='bg-accent text-accent-content z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold'>
                {i + 1}
              </span>
              {i < steps.length - 1 && <div className='bg-accent/20 mt-2 h-full w-1' />}
            </div>
            <div className='pt-2'>
              <p className='text-base-content text-sm font-semibold'>{step.label}</p>
              {step.desc && <p className='text-neutral mt-2 text-sm'>{step.desc}</p>}
            </div>
          </li>
        ))}
      </ol>
      <Footer citation={citation} />
    </Background>
  );
};

LearningPath.displayName = 'LearningPath';
