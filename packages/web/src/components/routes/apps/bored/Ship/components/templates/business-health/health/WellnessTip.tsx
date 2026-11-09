import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const WellnessTip: FC<TemplateProps> = ({ data }) => {
  const tip = (data.tip as string) ?? '';
  const category = (data.category as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const source = (data.source as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      {category && (
        <span className='text-accent mb-4 text-xs font-bold tracking-[0.2em] uppercase'>
          {category}
        </span>
      )}
      <svg
        className='text-accent/30 mb-4 h-8 w-8'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeWidth={1.5}>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
        />
      </svg>
      <p className='text-base-content text-xl leading-snug font-bold'>
        <strong>{tip}</strong>
      </p>
      <p className='text-neutral mt-4 text-sm leading-relaxed'>{subtitle}</p>
      {source && <cite className='text-accent mt-6 text-xs font-medium'>&mdash; {source}</cite>}
      <Footer citation={citation} />
    </Background>
  );
};

WellnessTip.displayName = 'WellnessTip';
