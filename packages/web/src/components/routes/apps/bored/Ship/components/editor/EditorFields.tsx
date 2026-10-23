import type { FC } from 'react';
import type { FieldDef } from '../../types';

export const EditorFields: FC<{ fields: FieldDef[] }> = ({ fields }) => (
  <div className='text-neutral mt-3 space-y-1 text-xs leading-relaxed'>
    <p className='text-accent font-semibold tracking-wider uppercase'>Fields:</p>
    {fields.map((f) => (
      <p key={f.key}>
        <span className='text-base-content font-mono'>{f.key}</span>
        <span className='text-neutral-content/40'>: {f.type}</span>
        <br />
        <span className='text-neutral'>{f.description}</span>
      </p>
    ))}
  </div>
);

EditorFields.displayName = 'EditorFields';
