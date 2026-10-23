'use client';

import { type FC } from 'react';

export type ViewMode = 'kanban' | 'list' | 'calendar' | 'timeline' | 'tasks';

const VIEWS: { value: ViewMode; label: string }[] = [
  { value: 'kanban', label: 'Kanban' },
  { value: 'list', label: 'List' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'timeline', label: 'Timeline' },
];

interface ViewSwitcherProps {
  value: ViewMode;
  onChange: (view: ViewMode) => void;
}

export const ViewSwitcher: FC<ViewSwitcherProps> = ({ value, onChange }) => (
  <div className='bg-base-100 border-base-300 flex items-center gap-1 border-b px-4 py-2'>
    {VIEWS.map((v) => (
      <button
        key={v.value}
        type='button'
        aria-pressed={value === v.value}
        onClick={() => onChange(v.value)}
        className={`btn btn-ghost btn-sm min-h-0 px-3 ${
          value === v.value ? 'bg-base-200 font-semibold' : ''
        }`}>
        {v.label}
      </button>
    ))}
  </div>
);
