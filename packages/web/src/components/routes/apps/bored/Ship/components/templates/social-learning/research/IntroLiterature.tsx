import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const IntroLiterature: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Research Paper';
  const question = (data.question as string) ?? 'What is the effect of X on Y?';
  const hypotheses = (data.hypotheses as string[]) ?? [
    'H₁: X has a significant effect on Y',
    'H₂: The effect is moderated by Z',
  ];
  const citations = (data.citations as string[]) ?? [
    'Smith et al. (2023)',
    'Johnson & Lee (2022)',
    'Williams (2021)',
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent mb-3 text-sm font-bold tracking-[0.2em] uppercase'>
        Introduction &amp; Literature Review
      </span>
      <h1 className='text-base-content text-4xl leading-tight font-bold'>{title}</h1>

      <div className='bg-primary/5 mt-6 rounded-lg border border-[#ff0030]/10 p-3'>
        <span className='text-accent text-sm font-bold tracking-[0.15em] uppercase'>
          Research Question
        </span>
        <p className='text-base-content mt-2 text-sm leading-relaxed font-medium'>{question}</p>
      </div>

      <div className='mt-6'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Hypotheses
        </span>
        <ul className='mt-2 flex flex-col gap-2'>
          {hypotheses.map((h, i) => (
            <li key={i} className='flex items-start gap-2'>
              <span className='bg-accent mt-2 h-2 w-2 flex-shrink-0 rounded-full' />
              <span className='text-base-content text-sm leading-relaxed'>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className='mt-6'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Key Literature
        </span>
        <ul className='mt-2 flex flex-wrap gap-2'>
          {citations.map((c, i) => (
            <li
              key={i}
              className='bg-base-200 text-base-content rounded-2xl px-2 py-2 text-sm font-medium'>
              {c}
            </li>
          ))}
        </ul>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

IntroLiterature.displayName = 'IntroLiterature';
