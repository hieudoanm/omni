import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const GradientText: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='from-primary to-accent mb-4 bg-gradient-to-r bg-clip-text text-center text-4xl font-black text-transparent'>
        {title || 'Create'}
      </h1>
      <p className='text-base-content max-w-md text-center text-base leading-relaxed font-light'>
        {text || 'Beautiful designs that inspire and motivate people every day.'}
      </p>
      <Footer citation={citation} />
    </Background>
  );
};

GradientText.displayName = 'GradientText';
