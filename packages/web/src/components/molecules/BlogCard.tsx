import { FC } from 'react';
import Link from 'next/link';
import { BlogPost } from '../../data/blog';
import { BlogDate } from '../atoms/BlogDate';
import { TagBadge } from '../atoms/TagBadge';

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard: FC<BlogCardProps> = ({ post }) => (
  <Link
    href={`/blog/${post.slug}`}
    className='card bg-base-200 border-base-300 hover:border-primary/40 group border transition-colors'>
    <div className='card-body p-7'>
      {post.coverImage && (
        <div className='bg-base-300 mb-4 flex h-44 items-center justify-center overflow-hidden rounded-lg'>
          <img
            src={post.coverImage}
            alt={post.title}
            loading='lazy'
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        </div>
      )}
      <div className='mb-3 flex items-center gap-3'>
        <BlogDate date={post.date} />
        {post.readingTime && (
          <span className='text-base-content/30 text-xs'>{post.readingTime} min read</span>
        )}
      </div>
      <h3 className='card-title text-base-content group-hover:text-primary mb-2 text-sm font-medium transition-colors'>
        {post.title}
      </h3>
      <p className='text-base-content/50 mb-4 line-clamp-2 text-sm leading-relaxed'>
        {post.description}
      </p>
      <div className='mt-auto flex flex-wrap gap-2'>
        {post.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
    </div>
  </Link>
);

BlogCard.displayName = 'BlogCard';
