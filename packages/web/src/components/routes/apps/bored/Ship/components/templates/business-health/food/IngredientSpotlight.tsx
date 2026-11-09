import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const IngredientSpotlight: FC<TemplateProps> = ({ data }) => {
  const name = (data.name as string) ?? '';
  const benefits = (data.benefits as string[]) ?? [];
  const uses = (data.uses as string[]) ?? [];
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>
        Ingredient Spotlight
      </span>
      <h1 className='text-base-content mt-2 text-4xl font-bold'>{name}</h1>
      {benefits.length > 0 && (
        <div className='mt-5'>
          <span className='text-neutral text-xs font-bold tracking-widest uppercase'>Benefits</span>
          <ul className='mt-2 flex flex-col gap-1.5'>
            {benefits.map((b, i) => (
              <li key={i} className='flex items-start gap-2'>
                <svg
                  className='text-accent mt-0.5 h-3.5 w-3.5 flex-shrink-0'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                </svg>
                <p className='text-base-content text-xs'>{b}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {uses.length > 0 && (
        <div className='mt-5'>
          <span className='text-neutral text-xs font-bold tracking-widest uppercase'>
            Ways to Use
          </span>
          <ul className='mt-2 flex flex-wrap gap-1.5'>
            {uses.map((u, i) => (
              <li key={i} className='rounded-box bg-base-300 text-neutral px-2.5 py-1 text-xs'>
                {u}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

IngredientSpotlight.displayName = 'IngredientSpotlight';
