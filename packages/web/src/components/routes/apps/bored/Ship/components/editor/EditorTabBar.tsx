import type { FC } from 'react';

export type EditorTab = 'editor' | 'all';

export const EditorTabBar: FC<{
  tab: EditorTab;
  onChange: (tab: EditorTab) => void;
}> = ({ tab, onChange }) => (
  <div className='border-base-content/10 flex border-b'>
    <button
      onClick={() => onChange('editor')}
      className={`flex-1 px-3 py-2 text-xs font-semibold tracking-widest uppercase transition-colors ${
        tab === 'editor'
          ? 'text-base-content border-b-2 border-current'
          : 'text-neutral hover:text-base-content'
      }`}>
      Single YAML
    </button>
    <button
      onClick={() => onChange('all')}
      className={`flex-1 px-3 py-2 text-xs font-semibold tracking-widest uppercase transition-colors ${
        tab === 'all'
          ? 'text-base-content border-b-2 border-current'
          : 'text-neutral hover:text-base-content'
      }`}>
      Full YAML
    </button>
  </div>
);
