import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Methods: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Methods';
  const design = (data.design as string) ?? 'Between-subjects experimental design';
  const procedure = (data.procedure as string[]) ?? [
    'Informed consent obtained',
    'Random assignment to conditions',
    'Task presentation and data collection',
    'Debriefing and compensation',
  ];
  const materials = (data.materials as string[]) ?? [
    'Custom survey (Qualtrics)',
    'Reaction time software (PsychoPy)',
    'Stimulus set (n = 120)',
  ];
  const analysis =
    (data.analysis as string) ?? 'Mixed-effects regression with random intercepts for participants';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent mb-3 text-sm font-bold tracking-[0.2em] uppercase'>Methods</span>
      <h1 className='text-base-content text-4xl leading-tight font-bold'>{title}</h1>

      <div className='bg-accent/10 mt-4 inline-flex self-start rounded-2xl px-4 py-2'>
        <span className='text-accent text-sm font-bold tracking-[0.1em] uppercase'>{design}</span>
      </div>

      <div className='mt-6'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Procedure
        </span>
        <ol className='mt-2 flex flex-col gap-2'>
          {procedure.map((p, i) => (
            <li key={i} className='flex items-start gap-3'>
              <span className='text-accent mt-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                {i + 1}
              </span>
              <span className='text-base-content text-sm leading-relaxed'>{p}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className='mt-6'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Materials
        </span>
        <ul className='mt-2 flex flex-wrap gap-2'>
          {materials.map((m, i) => (
            <li
              key={i}
              className='bg-base-200 text-base-content rounded-2xl px-2 py-2 text-sm font-medium'>
              {m}
            </li>
          ))}
        </ul>
      </div>

      <div className='bg-base-200 mt-6 rounded-lg p-3'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>Analysis</span>
        <p className='text-base-content mt-2 text-sm leading-relaxed'>{analysis}</p>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Methods.displayName = 'Methods';
