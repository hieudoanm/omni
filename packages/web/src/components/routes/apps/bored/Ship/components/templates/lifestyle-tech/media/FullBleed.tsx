import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const FullBleed: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background
      className='relative'
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundColor: imageUrl ? undefined : '#000000',
      }}>
      <div className='absolute inset-0 bg-black/60' />
      <div className='relative z-10 mx-8 max-w-lg text-center'>
        <h1 className='text-base-content mb-4 text-4xl leading-tight font-bold tracking-tight drop-shadow-lg'>
          {title}
        </h1>
        <p className='text-base-content/80 text-sm leading-relaxed drop-shadow'>{text}</p>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

FullBleed.displayName = 'FullBleed';
