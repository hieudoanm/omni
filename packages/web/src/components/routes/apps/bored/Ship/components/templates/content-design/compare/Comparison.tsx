import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface SideDef {
  label: string;
  text: string;
}

export const Comparison: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const before = (data.before as SideDef) ?? { label: 'Before', text: '' };
  const after = (data.after as SideDef) ?? { label: 'After', text: '' };
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='bg-accent/10 px-5 py-3'>
        <h1 className='text-base-content text-center text-4xl font-bold tracking-tight'>{title}</h1>
      </div>
      <div className='flex flex-1'>
        <div className='flex w-1/2 flex-col items-center justify-center gap-2 p-4'>
          <span className='bg-accent/10 text-accent rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase'>
            {before.label}
          </span>
          <pre className='text-neutral text-center text-base leading-relaxed'>{before.text}</pre>
          {imageUrl && (
            <img
              src={imageUrl}
              alt=''
              className='rounded-box h-28 w-full object-cover opacity-80'
            />
          )}
        </div>
        <div className='bg-primary/50 flex w-0.5 flex-shrink-0' />
        <div className='flex w-1/2 flex-col items-center justify-center gap-2 p-4'>
          <span className='bg-primary text-primary-content rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase'>
            {after.label}
          </span>
          <pre className='text-neutral text-center text-base leading-relaxed'>{after.text}</pre>
          {imageUrl && (
            <img
              src={imageUrl}
              alt=''
              className='rounded-box h-28 w-full object-cover opacity-80'
            />
          )}
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Comparison.displayName = 'Comparison';
