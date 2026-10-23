import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const FamousQuote: FC<TemplateProps> = ({ data }) => {
  const quote = (data.quote as string) ?? 'The only way to do great work is to love what you do.';
  const author = (data.author as string) ?? 'Steve Jobs';
  const source = (data.source as string) ?? '';
  const year = (data.year as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-primary mb-3 font-serif text-3xl'>"</span>
      <blockquote className='text-base-content mb-3 max-w-xl text-2xl leading-relaxed font-medium'>
        {quote}
      </blockquote>
      <span className='text-primary mb-3 font-serif text-3xl'>"</span>
      <p className='text-secondary mb-1 text-xs font-semibold'>— {author}</p>
      {source && <p className='text-accent mb-1 text-xs font-medium'>{source}</p>}
      {year && <time className='text-accent text-xs'>{year}</time>}
      <Footer citation={citation} />
    </Background>
  );
};
FamousQuote.displayName = 'FamousQuote';
