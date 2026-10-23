import type { FC } from 'react';

import type { PostItem } from '../../types';
import { PostItemRow } from './PostItemRow';

export const PostsList: FC<{
  posts: PostItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  templateLabel: (templateId: string) => string;
}> = ({
  posts,
  activeIndex,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  templateLabel,
}) => (
  <div className='flex h-full flex-col'>
    <div className='border-base-300 flex items-center justify-between border-b px-4 py-3'>
      <h2 className='text-neutral text-xs font-semibold tracking-widest uppercase'>
        Posts ({posts.length})
      </h2>
    </div>
    <div className='flex-1 overflow-y-auto px-2 py-3'>
      {posts.length === 0 ? (
        <p className='text-neutral px-2 text-xs'>No posts yet.</p>
      ) : (
        <div className='flex flex-col gap-1'>
          {posts.map((post, i) => (
            <PostItemRow
              key={post.id}
              post={post}
              index={i}
              isActive={i === activeIndex}
              total={posts.length}
              templateLabel={templateLabel}
              onSelect={onSelect}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);
