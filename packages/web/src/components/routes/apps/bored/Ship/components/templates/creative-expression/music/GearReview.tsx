import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const GearReview: FC<TemplateProps> = ({ data }) => {
  const name = (data.name as string) ?? 'Gear Review';
  const category = (data.category as string) ?? '';
  const rating = (data.rating as number) ?? 0;
  const price = (data.price as string) ?? '';
  const pros = (data.pros as string[]) ?? [];
  const cons = (data.cons as string[]) ?? [];

  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Gear Review</span>
      <h1 className='text-base-content mt-1 text-lg font-bold'>{name}</h1>
      {category && (
        <span className='bg-base-200 text-neutral mt-1 rounded px-1 py-0.5 text-xs font-bold'>
          {category}
        </span>
      )}
      <ul className='mt-1 flex gap-1'>
        {stars.map((filled, i) => (
          <li key={i} className={filled ? 'text-primary text-xs' : 'text-base-300 text-xs'}>
            ★
          </li>
        ))}
      </ul>
      {price && <p className='text-base-content mt-1 text-xs font-black'>{price}</p>}
      <div className='mt-2 w-full max-w-xs space-y-1'>
        {pros.length > 0 && (
          <ul className='text-left'>
            <li className='text-success mb-0.5 text-xs font-bold uppercase'>Pros</li>
            {pros.map((pro, i) => (
              <li key={i} className='text-base-content text-xs'>
                ✓ {pro}
              </li>
            ))}
          </ul>
        )}
        {cons.length > 0 && (
          <ul className='text-left'>
            <li className='text-error mb-0.5 text-xs font-bold uppercase'>Cons</li>
            {cons.map((con, i) => (
              <li key={i} className='text-base-content text-xs'>
                ✗ {con}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};
GearReview.displayName = 'GearReview';
