'use client';

import { FC, useState } from 'react';
import { FiPlus } from 'react-icons/fi';

interface TaskInputProps {
  onAdd: (text: string) => void;
}

const TaskInput: FC<TaskInputProps> = ({ onAdd }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  return (
    <div className='flex gap-2'>
      <input
        type='text'
        className='input input-bordered input-sm flex-1'
        placeholder='Add a task...'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
      />
      <button className='btn btn-primary btn-sm gap-1' onClick={handleSubmit}>
        <FiPlus size={14} /> Add
      </button>
    </div>
  );
};

export default TaskInput;
