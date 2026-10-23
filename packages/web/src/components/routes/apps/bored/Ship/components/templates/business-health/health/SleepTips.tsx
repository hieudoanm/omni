import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const SleepTips: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const tip = (data.tip as string) ?? '';
  const tips = (data.tips as string[]) ?? [];
  const quote = (data.quote as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>
        Sleep Hygiene
      </span>
      <h1 className='text-base-content mt-2 text-4xl font-bold'>{title}</h1>
      {tip && (
        <div className='bg-accent/5 rounded-box mt-4 px-4 py-3'>
          <span className='text-accent text-xs font-bold'>Today's Tip</span>
          <p className='text-base-content mt-1 text-sm'>{tip}</p>
        </div>
      )}
      {tips.length > 0 && (
        <ul className='mt-5 flex flex-col gap-2'>
          {tips.map((t, i) => (
            <li key={i} className='flex items-start gap-3'>
              <span className='text-accent mt-0.5 text-sm'>•</span>
              <p className='text-base-content text-sm'>{t}</p>
            </li>
          ))}
        </ul>
      )}
      {quote && (
        <blockquote className='text-neutral mt-5 text-xs italic'>&ldquo;{quote}&rdquo;</blockquote>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

SleepTips.displayName = 'SleepTips';
