import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const ProductShowcase: FC<TemplateProps> = ({ data }) => {
  const name = (data.name as string) ?? 'Minimal Watch';
  const price = (data.price as string) ?? '$299';
  const tagline = (data.tagline as string) ?? 'Timeless design, modern craft';
  const features = (data.features as string[]) ?? [
    'Water resistant',
    'Swiss movement',
    'Sapphire glass',
  ];
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='text-center'>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className='mx-auto h-32 w-32 rounded-full object-cover' />
        ) : (
          <div className='bg-base-200 mx-auto flex h-32 w-32 items-center justify-center rounded-full'>
            <span className='text-neutral/30 text-xs font-semibold uppercase'>Image</span>
          </div>
        )}
        <h2 className='text-base-content mt-4 text-xl font-bold'>{name}</h2>
        <div className='text-primary mt-1 text-3xl font-black'>{price}</div>
        <p className='text-neutral mt-1 text-xs'>{tagline}</p>
        <ul className='mt-3 flex flex-wrap justify-center gap-1.5'>
          {features.map((f, i) => (
            <li
              key={i}
              className='bg-base-200 text-base-content rounded px-2 py-0.5 text-xs font-medium'>
              {f}
            </li>
          ))}
        </ul>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

ProductShowcase.displayName = 'ProductShowcase';
