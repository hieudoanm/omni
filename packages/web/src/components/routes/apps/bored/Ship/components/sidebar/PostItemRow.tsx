import type { FC } from 'react';

import type { PostItem } from '../../types';
import { GripIcon } from '../_icons';
import { PostActions } from './PostActions';

export const PostItemRow: FC<{
  post: PostItem;
  index: number;
  isActive: boolean;
  total: number;
  templateLabel: (templateId: string) => string;
  onSelect: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
}> = ({
  post,
  index,
  isActive,
  total,
  templateLabel,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}) => (
  <div
    className={`rounded-btn group flex items-center gap-1 px-2 py-2 text-xs transition-all duration-200 ${
      isActive
        ? 'bg-primary text-primary-content'
        : 'text-neutral hover:bg-base-300 hover:text-base-content'
    }`}>
    <button
      onClick={() => onSelect(index)}
      className='flex min-w-0 flex-1 items-center gap-2 text-left'
      title={post.label ?? templateLabel(post.templateId)}>
      <GripIcon />
      <span className='truncate font-medium'>{post.label ?? templateLabel(post.templateId)}</span>
    </button>
    <div
      className={`transition-opacity ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
      <PostActions
        isFirst={index === 0}
        isLast={index === total - 1}
        canDelete={total > 1}
        onMoveUp={() => onMoveUp(index)}
        onMoveDown={() => onMoveDown(index)}
        onDuplicate={() => onDuplicate(index)}
        onDelete={() => onDelete(index)}
      />
    </div>
  </div>
);
