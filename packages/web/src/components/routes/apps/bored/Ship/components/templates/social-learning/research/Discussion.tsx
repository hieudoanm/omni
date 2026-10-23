import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Discussion: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Discussion';
  const interpretation =
    (data.interpretation as string) ??
    'The results support the hypothesis that X has a significant effect on Y, consistent with prior research.';
  const implications = (data.implications as string[]) ?? [
    'Findings advance theoretical understanding of X–Y relationship',
    'Practical applications for intervention design',
    'Opens new avenues for longitudinal research',
  ];
  const futureDirections = (data.futureDirections as string[]) ?? [
    'Replicate with larger, more diverse sample',
    'Examine long-term effects over 12 months',
    'Explore mediating mechanisms',
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent mb-3 text-sm font-bold tracking-[0.2em] uppercase'>
        Discussion
      </span>
      <h1 className='text-base-content text-4xl leading-tight font-bold'>{title}</h1>

      <div className='bg-base-200 mt-6 rounded-2xl p-3'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Interpretation
        </span>
        <p className='text-base-content mt-2 text-sm leading-relaxed'>{interpretation}</p>
      </div>

      <div className='mt-6'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Implications
        </span>
        <ul className='mt-2 flex flex-col gap-2'>
          {implications.map((imp, i) => (
            <li key={i} className='flex items-start gap-2'>
              <span className='bg-accent mt-2 h-2 w-2 flex-shrink-0 rounded-full' />
              <span className='text-base-content text-sm leading-relaxed'>{imp}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className='mt-6'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Future Directions
        </span>
        <ol className='mt-2 flex flex-col gap-2'>
          {futureDirections.map((fd, i) => (
            <li key={i} className='flex items-start gap-3'>
              <span className='text-accent mt-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                {i + 1}
              </span>
              <span className='text-base-content text-sm leading-relaxed'>{fd}</span>
            </li>
          ))}
        </ol>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Discussion.displayName = 'Discussion';
