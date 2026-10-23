import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Strikethrough: FC<TemplateProps> = ({ data }) => {
  const number = (data.number as string) ?? '$99';
  const replacement = (data.replacement as string) ?? 'FREE';
  const label = (data.label as string) ?? 'Limited Time Offer';
  const text = (data.text as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='text-center'>
        <div className='flex items-baseline justify-center gap-2'>
          <span className='text-base-content text-3xl leading-none font-black line-through opacity-40'>
            {number}
          </span>
          <span className='text-primary text-4xl leading-none font-black'>{replacement}</span>
        </div>
        {label && (
          <div className='text-base-content mt-2 text-sm font-bold tracking-wider uppercase'>
            {label}
          </div>
        )}
        {text && <p className='text-neutral mt-2 text-base leading-relaxed'>{text}</p>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Strikethrough.displayName = 'Strikethrough';
