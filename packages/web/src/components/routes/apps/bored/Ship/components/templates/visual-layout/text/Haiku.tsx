import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Haiku: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const line1 = (data.line1 as string) ?? '';
  const line2 = (data.line2 as string) ?? '';
  const line3 = (data.line3 as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='max-w-md text-center'>
        {title && (
          <h1 className='text-base-content mb-4 text-4xl font-bold tracking-tight'>{title}</h1>
        )}
        <div className='border-primary/30 space-y-3 border-l-2 pl-3'>
          <p className='text-base-content text-sm leading-relaxed'>
            {line1 || 'An old silent pond'}
          </p>
          <p className='text-base-content text-sm leading-relaxed'>
            {line2 || 'A frog jumps into the pond'}
          </p>
          <p className='text-base-content text-sm leading-relaxed'>
            {line3 || 'Splash! Silence again'}
          </p>
        </div>
        <p className='text-neutral mt-3 text-xs italic'>— haiku</p>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Haiku.displayName = 'Haiku';
