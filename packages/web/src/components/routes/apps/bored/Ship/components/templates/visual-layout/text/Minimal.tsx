import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Minimal: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex flex-col items-center justify-center'>
        <h1 className='text-base-content mb-2 text-4xl leading-tight font-bold tracking-tight'>
          {title}
        </h1>
        <p className='text-neutral mx-auto max-w-md text-sm leading-relaxed'>{text}</p>
      </div>
      {imageUrl ? (
        <img src={imageUrl} alt='' className='rounded-box h-24 w-full object-cover' />
      ) : (
        <></>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

Minimal.displayName = 'Minimal';
