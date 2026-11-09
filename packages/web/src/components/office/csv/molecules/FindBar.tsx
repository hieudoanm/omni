'use client';

import { FC } from 'react';
import { FiX } from 'react-icons/fi';

interface FindBarProps {
  text: string;
  replaceText: string;
  matchCount: number;
  current: number;
  onTextChange: (text: string) => void;
  onReplaceTextChange: (text: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

const FindBar: FC<FindBarProps> = ({
  text,
  replaceText,
  matchCount,
  current,
  onTextChange,
  onReplaceTextChange,
  onPrev,
  onNext,
  onReplace,
  onReplaceAll,
  onClose,
}) => (
  <div className='no-print border-base-300 bg-base-200 flex flex-wrap items-center gap-1 border-b px-2 py-1'>
    <label className='text-xs font-medium'>Find</label>
    <input
      aria-label='Find text'
      autoFocus
      className='input input-sm input-bordered w-40'
      value={text}
      onChange={(event) => onTextChange(event.target.value)}
    />
    <span className='min-w-14 text-center font-mono text-xs' aria-label='Match count'>
      {matchCount === 0 ? 'no matches' : `${current + 1}/${matchCount}`}
    </span>
    <button className='btn btn-ghost btn-xs' onClick={onPrev}>
      Prev
    </button>
    <button className='btn btn-ghost btn-xs' onClick={onNext}>
      Next
    </button>
    <label className='ml-2 text-xs font-medium'>Replace</label>
    <input
      aria-label='Replace text'
      className='input input-sm input-bordered w-40'
      value={replaceText}
      onChange={(event) => onReplaceTextChange(event.target.value)}
    />
    <button className='btn btn-ghost btn-xs' disabled={!text} onClick={onReplace}>
      Replace
    </button>
    <button className='btn btn-ghost btn-xs' disabled={!text} onClick={onReplaceAll}>
      All
    </button>
    <button className='btn btn-ghost btn-xs ml-auto' aria-label='Close find' onClick={onClose}>
      <FiX />
    </button>
  </div>
);

export default FindBar;
