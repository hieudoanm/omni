'use client';

import { FC } from 'react';
import { FiTrash2, FiX } from 'react-icons/fi';

interface CommentPopoverProps {
  cellLabel: string;
  text: string;
  onTextChange: (text: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const CommentPopover: FC<CommentPopoverProps> = ({
  cellLabel,
  text,
  onTextChange,
  onSave,
  onDelete,
  onClose,
}) => (
  <div className='no-print border-base-300 bg-base-100 fixed top-16 left-1/2 z-50 w-80 -translate-x-1/2 rounded-lg border p-3 shadow-xl'>
    <div className='mb-2 flex items-center justify-between'>
      <span className='text-sm font-semibold'>Comment on {cellLabel}</span>
      <button className='btn btn-ghost btn-xs' aria-label='Close comment' onClick={onClose}>
        <FiX />
      </button>
    </div>
    <textarea
      aria-label='Comment text'
      className='textarea textarea-bordered h-20 w-full resize-none font-sans text-sm'
      value={text}
      onChange={(event) => onTextChange(event.target.value)}
    />
    <div className='mt-2 flex items-center gap-2'>
      <button className='btn btn-primary btn-sm' onClick={onSave}>
        Save
      </button>
      <button className='btn btn-ghost btn-sm' disabled={!text} onClick={onDelete}>
        <FiTrash2 /> Delete
      </button>
    </div>
  </div>
);

export default CommentPopover;
