import type { FC } from 'react';

import { ChevronUpIcon, ChevronDownIcon, DuplicateIcon, TrashIcon } from '../_icons';

export const PostActions: FC<{
  isFirst: boolean;
  isLast: boolean;
  canDelete: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}> = ({ isFirst, isLast, canDelete, onMoveUp, onMoveDown, onDuplicate, onDelete }) => (
  <div className='flex items-center gap-0.5'>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onMoveUp();
      }}
      disabled={isFirst}
      className='rounded-btn hover:bg-base-content/10 p-1 disabled:opacity-20'
      title='Move up'>
      <ChevronUpIcon />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onMoveDown();
      }}
      disabled={isLast}
      className='rounded-btn hover:bg-base-content/10 p-1 disabled:opacity-20'
      title='Move down'>
      <ChevronDownIcon />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDuplicate();
      }}
      className='rounded-btn hover:bg-base-content/10 p-1'
      title='Duplicate'>
      <DuplicateIcon />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      disabled={!canDelete}
      className='rounded-btn hover:bg-base-content/10 p-1 disabled:opacity-20'
      title='Delete'>
      <TrashIcon />
    </button>
  </div>
);
