import type { FC } from 'react';

export const EditorToggle: FC<{
  open: boolean;
  onClick: () => void;
}> = ({ open, onClick }) => (
  <button
    onClick={onClick}
    className='btn btn-ghost btn-sm border-base-300/20 h-auto w-8 flex-shrink-0 self-stretch rounded-none border-r'
    title={open ? 'Hide editor sidebar' : 'Show editor sidebar'}>
    <span
      className='text-neutral/40 text-xs font-semibold tracking-widest uppercase'
      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
      Editor
    </span>
  </button>
);
