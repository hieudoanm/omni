import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const BookQuote: FC<TemplateProps> = ({ data }) => {
  const quote = (data.quote as string) ?? 'It is a truth universally acknowledged.';
  const book = (data.book as string) ?? 'Pride and Prejudice';
  const author = (data.author as string) ?? 'Jane Austen';
  const pageNumber = (data.pageNumber as string) ?? '';
  const genre = (data.genre as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <blockquote className='text-base-content mb-3 max-w-xl text-2xl leading-relaxed italic'>
        "{quote}"
      </blockquote>
      <p className='text-secondary mb-0.5 text-xs font-semibold'>{book}</p>
      <p className='text-base-content/70 mb-2 text-xs'>by {author}</p>
      <div className='flex items-center gap-2'>
        {genre && <p className='badge badge-accent badge-sm'>{genre}</p>}
        {pageNumber && <p className='badge badge-outline badge-sm'>p. {pageNumber}</p>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};
BookQuote.displayName = 'BookQuote';
