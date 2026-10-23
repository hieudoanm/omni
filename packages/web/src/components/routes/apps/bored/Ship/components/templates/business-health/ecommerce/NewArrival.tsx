import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const NewArrival: FC<TemplateProps> = ({ data }) => {
  const badge = (data.badge as string) ?? 'NEW';
  const name = (data.name as string) ?? 'Classic Tee';
  const price = (data.price as string) ?? '$49';
  const oldPrice = (data.oldPrice as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='text-center'>
        <div className='bg-primary text-primary-content inline-block rounded px-3 py-1 text-xs font-bold tracking-wider uppercase'>
          {badge}
        </div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className='mx-auto mt-3 h-36 w-36 rounded-lg object-cover'
          />
        ) : (
          <div className='bg-base-200 mx-auto mt-3 flex h-36 w-36 items-center justify-center rounded-lg'>
            <span className='text-neutral/30 text-xs font-semibold uppercase'>Image</span>
          </div>
        )}
        <h2 className='text-base-content mt-3 text-lg font-bold'>{name}</h2>
        <div className='mt-1 flex items-baseline justify-center gap-2'>
          <span className='text-primary text-2xl font-black'>{price}</span>
          {oldPrice && <span className='text-neutral text-sm line-through'>{oldPrice}</span>}
        </div>
        {subtitle && <p className='text-neutral mt-1 text-xs'>{subtitle}</p>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

NewArrival.displayName = 'NewArrival';
