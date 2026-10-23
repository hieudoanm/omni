import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const PhotoEditing: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Photo Editing';
  const beforeLabel = (data.beforeLabel as string) ?? 'Before';
  const afterLabel = (data.afterLabel as string) ?? 'After';
  const subtitle = (data.subtitle as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent mb-1 text-xs font-bold tracking-[0.2em] uppercase'>
        Photo Editing
      </h2>
      <Header title={title} />
      <div className='flex w-full max-w-md gap-1'>
        <div className='border-base-300 flex-1 rounded border p-2'>
          <span className='text-neutral text-xs font-bold uppercase'>{beforeLabel}</span>
          <div className='bg-base-300 mt-2 flex aspect-square items-center justify-center rounded'>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={beforeLabel}
                className='h-full w-full rounded object-cover opacity-50 grayscale'
              />
            ) : (
              <span className='text-neutral text-xs'>Original</span>
            )}
          </div>
        </div>
        <div className='border-base-300 flex-1 rounded border p-2'>
          <span className='text-primary text-xs font-bold uppercase'>{afterLabel}</span>
          <div className='bg-base-300 mt-2 flex aspect-square items-center justify-center rounded'>
            {imageUrl ? (
              <img src={imageUrl} alt={afterLabel} className='h-full w-full rounded object-cover' />
            ) : (
              <span className='text-neutral text-xs'>Edited</span>
            )}
          </div>
        </div>
      </div>
      {subtitle && <p className='text-neutral mt-2 max-w-sm text-xs leading-relaxed'>{subtitle}</p>}
      <Footer citation={citation} />
    </Background>
  );
};

PhotoEditing.displayName = 'PhotoEditing';
