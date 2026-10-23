import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const SplitScreen: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      {imageUrl ? (
        <img src={imageUrl} alt='' className='h-full w-1/2 object-cover' />
      ) : (
        <div className='border-accent/30 bg-accent/5 text-accent flex h-full w-1/2 items-center justify-center border-2 border-dashed text-sm'>
          <svg
            className='mr-1.5 h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
          Add image (9:16)
        </div>
      )}
      <div className='relative flex w-1/2 flex-col items-start justify-center p-8'>
        <div className='bg-primary absolute top-1/2 left-0 h-16 w-1 -translate-y-1/2 rounded-full' />
        <h1 className='text-base-content mb-2 text-4xl leading-tight font-bold tracking-tight'>
          {title}
        </h1>
        <p className='text-neutral max-w-xs text-base leading-relaxed'>{text}</p>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

SplitScreen.displayName = 'SplitScreen';
