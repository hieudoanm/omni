import type { FC } from 'react';

export type SidebarTab = 'posts' | 'templates';

export const SidebarTabBar: FC<{
  tab: SidebarTab;
  onChange: (tab: SidebarTab) => void;
}> = ({ tab, onChange }) => (
  <div className='border-base-300 flex border-b'>
    <button
      onClick={() => onChange('posts')}
      className={`flex-1 px-3 py-2 text-xs font-semibold tracking-widest uppercase transition-all ${
        tab === 'posts'
          ? 'text-base-content border-b-2 border-current'
          : 'text-neutral hover:text-base-content'
      }`}>
      Posts
    </button>
    <button
      onClick={() => onChange('templates')}
      className={`flex-1 px-3 py-2 text-xs font-semibold tracking-widest uppercase transition-all ${
        tab === 'templates'
          ? 'text-base-content border-b-2 border-current'
          : 'text-neutral hover:text-base-content'
      }`}>
      Templates
    </button>
  </div>
);
