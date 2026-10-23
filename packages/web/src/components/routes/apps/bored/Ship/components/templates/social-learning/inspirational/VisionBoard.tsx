import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const VisionBoard: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div
        className='flex h-1/2 w-full items-end bg-cover bg-center p-6'
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : { backgroundColor: '#e5e7eb' }}>
        <div className='rounded-box bg-base-100/90 w-full px-4 py-4 backdrop-blur-sm'>
          <h1 className='text-base-content text-4xl leading-tight font-bold'>{title}</h1>
        </div>
      </div>
      <div className='flex flex-1 items-center justify-center p-6'>
        <p className='text-neutral text-center text-sm leading-relaxed'>{text}</p>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

VisionBoard.displayName = 'VisionBoard';
