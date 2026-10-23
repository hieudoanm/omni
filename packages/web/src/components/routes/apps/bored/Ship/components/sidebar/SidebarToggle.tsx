import type { FC } from 'react';

import type { SidebarTab } from './SidebarTabBar';

export const SidebarToggle: FC<{
  open: boolean;
  tab: SidebarTab;
  onClick: () => void;
}> = ({ open, tab, onClick }) => (
  <button
    onClick={onClick}
    className='btn btn-ghost btn-sm border-base-300/20 h-auto w-8 flex-shrink-0 self-stretch rounded-none border-l'
    title={open ? 'Hide template sidebar' : 'Show template sidebar'}>
    <span
      className='text-neutral/40 text-xs font-semibold tracking-widest uppercase'
      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
      {tab === 'posts' ? 'Posts' : 'Templates'}
    </span>
  </button>
);
