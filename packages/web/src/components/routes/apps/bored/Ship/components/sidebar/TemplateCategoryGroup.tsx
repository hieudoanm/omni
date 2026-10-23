import type { FC } from 'react';

import type { TemplateDef } from '../../types';
import { TemplateItem } from './TemplateItem';

export const TemplateCategoryGroup: FC<{
  label: string;
  templates: TemplateDef[];
  onPreview: (id: string) => void;
  onPick: (id: string) => void;
}> = ({ label, templates, onPreview, onPick }) => (
  <div className='mb-5 last:mb-0'>
    <h3 className='text-accent mb-2 text-[10px] font-bold tracking-[0.15em] uppercase'>{label}</h3>
    <div className='flex flex-col gap-1'>
      {templates.map((t) => (
        <TemplateItem key={t.id} template={t} onPreview={onPreview} onPick={onPick} />
      ))}
    </div>
  </div>
);
