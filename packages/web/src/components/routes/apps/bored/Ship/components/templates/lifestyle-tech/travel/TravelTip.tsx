import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const TravelTip: FC<TemplateProps> = ({ data }) => {
  const tip = (data.tip as string) ?? '';
  const category = (data.category as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const hashtag = (data.hashtag as string) ?? '';

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
        <path strokeLinecap='round' strokeLinejoin='round' d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
      </svg>
      <p className='text-base-content text-lg leading-snug font-bold'>{tip}</p>
      <p className='text-neutral mt-4 text-sm leading-relaxed'>{subtitle}</p>
      {hashtag && <span className='text-accent mt-6 text-xs font-medium'>{hashtag}</span>}
      <Footer citation={citation} />
    </Background>
  );
};

TravelTip.displayName = 'TravelTip';
