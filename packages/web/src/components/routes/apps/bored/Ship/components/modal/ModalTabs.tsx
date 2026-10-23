import type { FC } from 'react';

export type DocTab = 'raw' | 'preview';
export type DocType = 'templates' | 'posts';

export const ModalTabs: FC<{
  tab: DocTab;
  onChange: (tab: DocTab) => void;
}> = ({ tab, onChange }) => (
  <div className='rounded-box border-base-300 flex gap-1 border p-0.5'>
    {(['raw', 'preview'] as const).map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        className={`rounded-box px-3 py-1 text-xs font-medium transition-all ${
          t === tab ? 'bg-base-300 text-base-content' : 'text-neutral hover:text-base-content'
        }`}>
        {t === 'raw' ? 'Raw' : 'Preview'}
      </button>
    ))}
  </div>
);
