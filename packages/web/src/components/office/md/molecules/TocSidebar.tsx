'use client';

import { FC } from 'react';
import { TbList } from 'react-icons/tb';
import type { TocItem } from '@/lib/office/md/types';

interface TocSidebarProps {
  items: TocItem[];
}

export const TocSidebar: FC<TocSidebarProps> = ({ items }) => {
  const scrollTo = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <aside className='border-base-content/10 bg-base-200/50 hidden h-full min-h-0 w-56 shrink-0 overflow-y-auto border-l p-2 lg:block'>
      <div className='text-base-content/50 mb-1 flex items-center gap-2 px-2 py-1 text-xs font-semibold tracking-wider uppercase'>
        <TbList size={14} />
        Outline
      </div>

      {items.length === 0 ? (
        <p className='text-base-content/40 px-2 py-1 text-xs'>
          No headings yet. Add some with the H1-H3 buttons.
        </p>
      ) : (
        <ul className='flex list-none flex-col gap-0.5'>
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={`hover:bg-base-content/10 hover:text-primary block w-full truncate rounded px-2 py-1 text-left text-sm ${
                  item.level > 1 ? 'pl-5' : ''
                } ${item.level > 2 ? 'pl-8' : ''}`}
                style={{ fontSize: `${Math.max(12, 15 - item.level)}px` }}
                onClick={() => scrollTo(item.id)}
                title={item.text}>
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};
