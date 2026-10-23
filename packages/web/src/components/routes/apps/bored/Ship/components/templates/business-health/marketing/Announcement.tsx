import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Announcement: FC<TemplateProps> = ({ data }) => {
  const badge = (data.badge as string) ?? 'New';
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';
  const date = (data.date as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-6'>
        <span className='bg-primary text-primary-content rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase'>
          {badge}
        </span>
      </div>
      <h1 className='text-base-content mb-4 text-4xl leading-tight font-bold tracking-tight'>
        {title}
      </h1>
      <p className='text-neutral mb-8 max-w-md text-base leading-relaxed'>{text}</p>
      <div className='mt-auto'>
        <div className='bg-accent/20 h-0.5 w-full rounded-full' />
        <p className='text-accent mt-4 text-sm font-medium tracking-wider uppercase'>
          <time>{date}</time>
        </p>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Announcement.displayName = 'Announcement';
