import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const InvestmentTip: FC<TemplateProps> = ({ data }) => {
  const tip = (data.tip as string) ?? '';
  const category = (data.category as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const risk = (data.risk as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      {category && (
        <span className='text-accent mb-4 text-xs font-bold tracking-[0.2em] uppercase'>
          {category}
        </span>
      )}
      <svg
        className='text-accent/40 mb-4 h-8 w-8'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeWidth={1.5}>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
      <blockquote className='text-base-content text-lg leading-snug font-bold'>
        &ldquo;{tip}&rdquo;
      </blockquote>
      <p className='text-neutral mt-3 text-sm leading-relaxed'>{subtitle}</p>
      {risk && (
        <span
          className={`mt-5 rounded-full px-3 py-0.5 text-xs font-bold ${
            risk === 'Low'
              ? 'bg-accent/10 text-accent'
              : risk === 'Medium'
                ? 'bg-accent/20 text-accent'
                : 'bg-accent/30 text-accent'
          }`}>
          {risk} Risk
        </span>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

InvestmentTip.displayName = 'InvestmentTip';
