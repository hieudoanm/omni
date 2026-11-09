import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const PackingList: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const items = (data.items as string[]) ?? [];
  const tip = (data.tip as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-base-content text-4xl font-bold'>{title}</h1>
        <span className='text-neutral text-xs'>{items.length} items</span>
      </div>
      <ul className='flex flex-col gap-2'>
        {items.map((item, i) => (
          <li key={i} className='flex items-center gap-4'>
            <span className='border-accent/20 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-xs' />
            <p className='text-base-content text-sm'>{item}</p>
          </li>
        ))}
      </ul>
      {tip && (
        <div className='border-accent/20 mt-6 border-t pt-4'>
          <p className='text-neutral text-xs'>{tip}</p>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

PackingList.displayName = 'PackingList';
