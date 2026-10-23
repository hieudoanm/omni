'use client';

import { FC } from 'react';
import { PRIORITY_OPTIONS, PriorityFilter } from '@/lib/office/tasks/types';

interface PriorityFilterSelectProps {
  value: PriorityFilter;
  onChange: (value: PriorityFilter) => void;
}

const PriorityFilterSelect: FC<PriorityFilterSelectProps> = ({ value, onChange }) => (
  <select
    className='select select-bordered select-sm w-full max-w-xs'
    value={value}
    onChange={(e) => onChange(e.target.value as PriorityFilter)}>
    {PRIORITY_OPTIONS.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export default PriorityFilterSelect;
