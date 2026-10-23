import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const HypothesisCard: FC<TemplateProps> = ({ data }) => {
  const hypothesis =
    (data.hypothesis as string) ?? 'Users who see personalized content engage 40% more';
  const variables = (data.variables as { name: string; type: string }[]) ?? [
    { name: 'Content type', type: 'Independent' },
    { name: 'Engagement rate', type: 'Dependent' },
  ];
  const method = (data.method as string) ?? 'A/B Testing';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent mb-3 text-sm font-bold tracking-[0.2em] uppercase'>
        Hypothesis
      </span>
      <div className='bg-accent/10 rounded-box p-3'>
        <p className='text-base-content text-sm leading-relaxed font-medium'>{hypothesis}</p>
      </div>
      <div className='mt-6'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Variables
        </span>
        <ul className='bg-base-200 rounded-box mt-2 overflow-hidden'>
          <li className='border-base-300 flex border-b px-4 py-2'>
            <span className='text-neutral flex-1 text-sm font-bold uppercase'>Name</span>
            <span className='text-neutral text-[9px] font-bold uppercase'>Type</span>
          </li>
          {variables.map((v, i) => (
            <li
              key={i}
              className='border-base-300 flex items-center justify-between border-b px-4 py-2 last:border-b-0'>
              <span className='text-base-content text-sm font-medium'>{v.name}</span>
              <span className='bg-accent/10 text-accent rounded-2xl px-2 py-2 text-sm font-bold'>
                {v.type}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className='mt-auto pt-6'>
        <span className='bg-base-200 text-neutral inline-flex items-center rounded-2xl px-4 py-2 text-sm font-bold'>
          {method}
        </span>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};
HypothesisCard.displayName = 'HypothesisCard';
