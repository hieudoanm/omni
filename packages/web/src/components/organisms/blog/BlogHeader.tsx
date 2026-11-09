import { FC } from 'react';
import Link from 'next/link';

interface BlogHeaderProps {
  title?: string;
  description?: string;
}

export const BlogHeader: FC<BlogHeaderProps> = ({
  title = 'Blog',
  description = 'Thoughts, tutorials, and insights on software engineering and design.',
}) => {
  return (
    <div className='border-base-300 mx-12 border-b'>
      <div className='mx-auto flex max-w-5xl flex-col items-start px-12 py-24 text-left'>
        <p className='text-primary mb-3 text-xs tracking-[0.2em] uppercase'>/blog</p>
        <h1 className='mb-4 font-serif text-5xl leading-[1.05] font-black tracking-tight'>
          {title}
        </h1>
        <p className='text-base-content/60 mb-8 max-w-xl text-base leading-relaxed'>
          {description}
        </p>
        <div className='flex items-center gap-3 text-xs'>
          <Link href='/apps' className='text-base-content/40 hover:text-primary transition-colors'>
            Home
          </Link>
          <span className='text-base-content/20'>/</span>
          <span className='text-base-content/60'>Blog</span>
        </div>
      </div>
    </div>
  );
};
BlogHeader.displayName = 'BlogHeader';
