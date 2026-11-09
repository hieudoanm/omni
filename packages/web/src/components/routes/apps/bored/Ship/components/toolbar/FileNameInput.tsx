import type { FC } from 'react';

export const FileNameInput: FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <label className='flex flex-col gap-1'>
    <span className='text-neutral text-center text-xs font-semibold tracking-widest uppercase'>
      File Name
    </span>
    <input
      type='text'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder='yyyy-mm-dd'
      className='rounded-box border-base-300 bg-base-200 text-neutral hover:border-neutral hover:text-base-content w-36 border px-3 py-1.5 text-xs font-medium tracking-wider transition-all duration-200 placeholder:opacity-40'
    />
  </label>
);
