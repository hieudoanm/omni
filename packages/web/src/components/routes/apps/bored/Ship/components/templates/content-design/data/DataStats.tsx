import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const DataStats: FC<TemplateProps> = ({ data }) => {
  const stat = (data.stat as string) ?? (data.number as string) ?? '84%';
  const title = (data.title as string) ?? (data.label as string) ?? '';
  const text = (data.text as string) ?? (data.context as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';
  const suffix = (data.suffix as string) ?? '';
  const source = (data.source as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex flex-col gap-4'>
        <div className='relative z-10'>
          <div className='text-primary mb-1 text-4xl font-black tracking-tight'>{stat}</div>
          {suffix && <p className='text-neutral mb-2 text-sm'>{suffix}</p>}
          <h1 className='text-base-content mb-2 text-xl font-bold tracking-tight'>{title}</h1>
          <p className='text-neutral mx-auto max-w-sm text-base leading-relaxed'>{text}</p>
          {source && <p className='text-neutral mt-2 text-xs'>— {source}</p>}
        </div>
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

DataStats.displayName = 'DataStats';
