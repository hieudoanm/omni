import { FC } from 'react';
import Link from 'next/link';
import { BlogMeta } from '../../data/blog';
import { TagBadge } from '../atoms/TagBadge';

interface BlogSidebarProps {
  meta: BlogMeta;
  activeTag?: string;
  onTagClick?: (tag: string) => void;
}

export const BlogSidebar: FC<BlogSidebarProps> = ({ meta, activeTag, onTagClick }) => (
  <aside className='flex flex-col gap-8'>
    <div>
      <p className='text-base-content/50 mb-3 text-xs font-medium tracking-[0.14em] uppercase'>
        Tags
      </p>
      <div className='flex flex-wrap gap-2'>
        {meta.tags.map(({ name, count }) => (
          <div key={name} className='flex items-center gap-1'>
            <TagBadge tag={name} active={name === activeTag} onClick={onTagClick} />
            <span className='text-base-content/20 text-xs'>{count}</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <p className='text-base-content/50 mb-3 text-xs font-medium tracking-[0.14em] uppercase'>
        Recent posts
      </p>
      <div className='flex flex-col gap-3'>
        {meta.recentPosts.map(({ slug, title, date }) => (
          <Link
            key={slug}
            href={`/blog/${slug}`}
            className='text-base-content/60 hover:text-base-content group text-sm leading-relaxed transition-colors'>
            <span className='group-hover:text-primary transition-colors'>{title}</span>
            <span className='text-base-content/30 ml-2 text-xs'>{date}</span>
          </Link>
        ))}
      </div>
    </div>
  </aside>
);

BlogSidebar.displayName = 'BlogSidebar';
