import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const OfferBanner: FC<TemplateProps> = ({ data }) => {
  const badge = (data.badge as string) ?? '';
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';
  const code = (data.code as string) ?? '';
  const cta = (data.cta as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='rounded-box border-primary/40 flex flex-1 flex-col items-center justify-center border-2 border-dashed p-8 text-center'>
        {badge && (
          <span className='bg-primary/10 text-primary mb-4 rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase'>
            {badge}
          </span>
        )}
        <h1 className='text-base-content mb-3 text-4xl font-bold tracking-tight'>
          {title || 'Special Offer'}
        </h1>
        <p className='text-neutral mb-6 max-w-sm text-sm leading-relaxed'>
          {text || 'Limited time offer. Get started today and save big.'}
        </p>
        {code && (
          <div className='bg-accent/10 mb-6 rounded-lg px-6 py-3'>
            <span className='text-base-content text-sm font-bold tracking-widest'>{code}</span>
          </div>
        )}
        <div className='rounded-box bg-primary text-primary-content px-10 py-3 text-sm font-bold tracking-wider uppercase'>
          {cta || 'Get Started'}
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

OfferBanner.displayName = 'OfferBanner';
