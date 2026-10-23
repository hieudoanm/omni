'use client';

import { FC } from 'react';
import { DUE_OPTIONS, DueFilter } from '@/lib/office/tasks/types';

interface DueFilterSelectProps {
  value: DueFilter;
  onChange: (value: DueFilter) => void;
}

const DueFilterSelect: FC<DueFilterSelectProps> = ({ value, onChange }) => (
  <select
    className='select select-bordered select-sm w-full max-w-xs'
    value={value}
    onChange={(e) => onChange(e.target.value as DueFilter)}>
    {DUE_OPTIONS.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export default DueFilterSelect;
