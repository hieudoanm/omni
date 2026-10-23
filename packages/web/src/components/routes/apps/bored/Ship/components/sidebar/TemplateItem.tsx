import type { FC } from 'react';

import type { TemplateDef } from '../../types';

export const TemplateItem: FC<{
  template: TemplateDef;
  onPreview: (id: string) => void;
  onPick: (id: string) => void;
}> = ({ template, onPreview, onPick }) => (
  <div className='rounded-btn group hover:bg-base-300 flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-all duration-200'>
    <button
      onClick={() => onPreview(template.id)}
      title={template.description}
      className='text-neutral hover:text-base-content flex min-w-0 flex-1 text-left'>
      {template.label}
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onPick(template.id);
      }}
      title='Add to posts'
      className='rounded-btn text-neutral/40 hover:text-base-content p-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='14'
        height='14'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'>
        <path d='M5 12h14' />
        <path d='M12 5v14' />
      </svg>
    </button>
  </div>
);
