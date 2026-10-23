import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Affirmation: FC<TemplateProps> = ({ data }) => {
  const affirmation = (data.affirmation as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-sm font-bold tracking-[0.2em] uppercase'>I Am</span>
      <h1 className='text-base-content text-4xl leading-tight font-bold tracking-tight'>
        {affirmation}
      </h1>
      {subtitle && <p className='text-neutral max-w-xs text-sm leading-relaxed'>{subtitle}</p>}
      <Footer citation={citation} />
    </Background>
  );
};

Affirmation.displayName = 'Affirmation';
