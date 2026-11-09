import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const BucketList: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const items = (data.items as { place: string; reason: string }[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase'>
        Bucket List
      </span>
      <h1 className='text-base-content mb-6 text-4xl font-bold'>{title}</h1>
      <ol className='flex flex-col gap-4'>
        {items.map((item, i) => (
          <li key={i} className='flex items-start gap-4'>
            <span className='text-accent mt-0.5 font-mono text-base font-bold'>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className='text-base-content text-base font-semibold'>{item.place}</p>
              <p className='text-neutral mt-0.5 text-xs'>{item.reason}</p>
            </div>
          </li>
        ))}
      </ol>
      <Footer citation={citation} />
    </Background>
  );
};

BucketList.displayName = 'BucketList';
