import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const PullQuote: FC<TemplateProps> = ({ data }) => {
  const quote = (data.quote as string) ?? '';
  const author = (data.author as string) ?? '';
  const source = (data.source as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';
  const text = (data.text as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=''
          className='ring-base-300 mb-3 h-16 w-16 rounded-full object-cover ring-2'
        />
      )}
      <div className='max-w-lg text-center'>
        <span className='text-primary/20 mb-3 block text-4xl leading-none font-black'>&ldquo;</span>
        <blockquote className='mb-3'>
          <p className='text-base-content text-4xl leading-relaxed font-light italic'>
            {quote || text || 'The only way to do great work is to love what you do.'}
          </p>
        </blockquote>
        <span className='text-base-content mb-2 block text-xs font-bold'>
          <strong>{author || 'Steve Jobs'}</strong>
        </span>
        {source && <span className='text-neutral text-xs'>{source}</span>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

PullQuote.displayName = 'PullQuote';
