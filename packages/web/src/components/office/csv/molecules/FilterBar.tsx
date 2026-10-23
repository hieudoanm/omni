'use client';

import { FC } from 'react';
import { FiX } from 'react-icons/fi';
import { columnToLabel } from '@/lib/office/csv/columns';

interface FilterBarProps {
  cols: number;
  col: number;
  text: string;
  onColChange: (col: number) => void;
  onTextChange: (text: string) => void;
  onClose: () => void;
}

const FilterBar: FC<FilterBarProps> = ({ cols, col, text, onColChange, onTextChange, onClose }) => (
  <div className='no-print border-base-300 bg-base-200 flex flex-wrap items-center gap-1 border-b px-2 py-1'>
    <label className='text-xs font-medium'>Filter</label>
    <select
      aria-label='Filter column'
      className='select select-ghost select-sm w-20 font-normal'
      value={col}
      onChange={(event) => onColChange(Number(event.target.value))}>
      {Array.from({ length: cols }, (_, index) => (
        <option key={index} value={index}>
          {columnToLabel(index)}
        </option>
      ))}
    </select>
    <input
      aria-label='Filter text'
      autoFocus
      className='input input-sm input-bordered w-40'
      placeholder='Contains...'
      value={text}
      onChange={(event) => onTextChange(event.target.value)}
    />
    <button className='btn btn-ghost btn-xs' disabled={!text} onClick={() => onTextChange('')}>
      Clear
    </button>
    <button className='btn btn-ghost btn-xs ml-auto' aria-label='Close filter' onClick={onClose}>
      <FiX />
    </button>
  </div>
);

export default FilterBar;
