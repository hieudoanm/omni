import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const Checklist: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';
  const items = (data.items as string[]) ?? [];
  const list = items.length > 0 ? items : ['Task one', 'Task two', 'Task three', 'Task four'];
  const citation = (data.citation as string) ?? '';

  return (
    <Background>
      <div className='flex flex-col gap-y-4'>
        <Header title={title} subtitle={text || undefined} />
        <ul className='flex min-h-0 flex-1 flex-col gap-1 text-left'>
          {list.map((item: string, i) => (
            <li
              key={item}
              className='rounded-box bg-accent/5 flex items-center gap-x-3 gap-y-1 py-2 pr-2'>
              <div className='bg-primary/20 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full'>
                <svg
                  className='text-primary h-4 w-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={3}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <span className='text-base-content text-xs leading-snug font-medium'>{item}</span>
            </li>
          ))}
        </ul>
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

Checklist.displayName = 'Checklist';
