import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const PricingCard: FC<TemplateProps> = ({ data }) => {
  const plan = (data.plan as string) ?? '';
  const price = (data.price as string) ?? '';
  const features = (data.features as string[]) ?? [];
  const items = features.length > 0 ? features : ['Feature one', 'Feature two', 'Feature three'];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='bg-accent/10 text-accent mb-2 rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase'>
        {plan}
      </span>
      <p className='text-base-content mb-6 text-3xl font-black tracking-tight'>
        <strong>{price}</strong>
      </p>
      <ul className='flex flex-col gap-3'>
        {items.map((f, i) => (
          <li key={i} className='flex items-center gap-3'>
            <svg
              className='text-primary h-4 w-4 flex-shrink-0'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={3}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
            </svg>
            <span className='text-neutral text-sm'>{f}</span>
          </li>
        ))}
      </ul>
      <div className='rounded-box bg-primary text-primary-content mt-8 px-8 py-3 text-sm font-bold tracking-wider uppercase'>
        Get Started
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

PricingCard.displayName = 'PricingCard';
