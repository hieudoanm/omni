'use client';

import { FC } from 'react';
import { FiX } from 'react-icons/fi';
import { Label } from '@/lib/office/tasks/types';

interface LabelFiltersProps {
  labels: Label[];
  activeLabel: string | null;
  onChange: (labelId: string | null) => void;
}

const LabelFilters: FC<LabelFiltersProps> = ({ labels, activeLabel, onChange }) => (
  <div className='flex flex-wrap gap-1'>
    {labels.map((label) => (
      <button
        key={label.id}
        className={`badge badge-sm cursor-pointer gap-1 ${
          activeLabel === label.id ? 'badge-primary' : 'badge-outline'
        }`}
        style={{
          backgroundColor: activeLabel === label.id ? label.color : undefined,
          borderColor: label.color,
          color: activeLabel === label.id ? '#fff' : label.color,
        }}
        onClick={() => onChange(activeLabel === label.id ? null : label.id)}>
        {label.name}
        {activeLabel === label.id && <FiX size={10} />}
      </button>
    ))}
  </div>
);

export default LabelFilters;
