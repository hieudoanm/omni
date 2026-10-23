'use client';

import { FC } from 'react';
import { TbEdit, TbColumns2, TbEye } from 'react-icons/tb';
import type { ViewMode } from '@/lib/office/md/types';

interface ViewControlsProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const MODES: { value: ViewMode; label: string; icon: FC<{ size?: number }> }[] = [
  { value: 'editor', label: 'Editor', icon: TbEdit },
  { value: 'split', label: 'Split', icon: TbColumns2 },
  { value: 'preview', label: 'Preview', icon: TbEye },
];

export const ViewControls: FC<ViewControlsProps> = ({ value, onChange }) => (
  <div className='btn-group' role='radiogroup' aria-label='View mode'>
    {MODES.map(({ value: mode, label, icon: Icon }) => (
      <button
        key={mode}
        className={`btn btn-xs ${
          value === mode ? 'btn-primary' : 'btn-ghost'
        } tooltip tooltip-bottom`}
        data-tip={label}
        onClick={() => onChange(mode)}
        aria-pressed={value === mode}
        aria-label={label}>
        <Icon size={15} />
      </button>
    ))}
  </div>
);
