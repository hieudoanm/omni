import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const VideoStill: FC<TemplateProps> = ({ data }) => {
  const imageUrl = (data.imageUrl as string) ?? '';
  const title = (data.title as string) ?? '';
  const duration = (data.duration as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background className='relative'>
      {imageUrl ? (
        <img src={imageUrl} alt='' className='absolute inset-0 object-cover' />
      ) : (
        <div className='absolute inset-0 flex items-center justify-center bg-black/80'>
          <span className='text-neutral text-xs'>Video thumbnail (16:9)</span>
        </div>
      )}
      <div className='absolute inset-0 bg-black/40' />
      <div className='relative z-10 flex flex-col items-center gap-4'>
        <div className='bg-primary/90 flex h-16 w-16 items-center justify-center rounded-full'>
          <svg className='ml-1 h-8 w-8 text-white' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M8 5v14l11-7z' />
          </svg>
        </div>
        {title && (
          <h1 className='text-center text-4xl font-bold text-white drop-shadow-lg'>{title}</h1>
        )}
        {duration && (
          <span className='rounded bg-black/60 px-2 py-0.5 text-xs text-white'>{duration}</span>
        )}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

VideoStill.displayName = 'VideoStill';
