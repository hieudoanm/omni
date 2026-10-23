import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const RatingScale: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const rating = (data.rating as number) ?? 4;
  const scaleMax = (data.scaleMax as number) ?? 5;
  const label = (data.label as string) ?? '';
  const sublabel = (data.sublabel as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-2 text-center text-4xl font-bold tracking-tight'>
        {title || 'Rating'}
      </h1>
      <div className='mb-2 flex gap-1'>
        {Array.from({ length: scaleMax }, (_, i) => (
          <svg
            key={i}
            className={`h-12 w-12 ${i < rating ? 'text-primary' : 'text-neutral/20'}`}
            fill='currentColor'
            viewBox='0 0 20 20'>
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
        ))}
      </div>
      {label && <p className='text-base-content text-sm font-bold'>{label}</p>}
      {sublabel && <p className='text-neutral mt-1 text-sm'>{sublabel}</p>}
      <div className='mt-2 flex w-full max-w-xs gap-1'>
        <span className='text-neutral text-xs'>1</span>
        <div className='flex-1' />
        <span className='text-neutral text-xs'>{scaleMax}</span>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

RatingScale.displayName = 'RatingScale';
