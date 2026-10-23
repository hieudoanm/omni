import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

const VERDICT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  true: { bg: 'bg-success', text: 'text-success-content', label: 'TRUE' },
  false: { bg: 'bg-error', text: 'text-error-content', label: 'FALSE' },
  partial: {
    bg: 'bg-warning',
    text: 'text-warning-content',
    label: 'PARTIALLY TRUE',
  },
};

export const FactCheck: FC<TemplateProps> = ({ data }) => {
  const claim = (data.claim as string) ?? '';
  const verdict = (data.verdict as string) ?? 'false';
  const source = (data.source as string) ?? '';
  const explanation = (data.explanation as string) ?? '';

  const style = VERDICT_STYLES[verdict] ?? VERDICT_STYLES.false;

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-4 text-center'>
        <h2 className='text-accent text-sm font-bold tracking-[0.2em] uppercase'>Fact Check</h2>
      </div>
      <div className='border-base-300 rounded-2xl border p-4 text-center'>
        <h3 className='text-neutral mb-3 text-sm font-semibold tracking-wider uppercase'>
          The Claim
        </h3>
        <div className='text-base-content text-sm leading-relaxed italic'>"{claim}"</div>
      </div>
      <div className='mt-4 flex flex-1 flex-col items-center justify-center gap-4'>
        <span
          className={`${style.bg} ${style.text} rounded px-4 py-2 text-sm font-black tracking-wider`}>
          {style.label}
        </span>
        {explanation && (
          <p className='text-neutral max-w-md text-center text-sm leading-relaxed'>{explanation}</p>
        )}
        {source && <p className='text-neutral text-sm'>Source: {source}</p>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

FactCheck.displayName = 'FactCheck';
