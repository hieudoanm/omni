import { FC } from 'react';

interface BlogFooterProps {
  name?: string;
  year?: number;
}

export const BlogFooter: FC<BlogFooterProps> = ({
  name = 'Blog',
  year = new Date().getFullYear(),
}) => {
  return (
    <footer className='border-base-300 border-t py-12 text-center'>
      <p className='text-primary mb-3 font-serif text-2xl font-bold tracking-widest'>{name}</p>
      <p className='text-base-content/30 text-sm'>
        &copy; {year} {name} &middot; Built with care
      </p>
    </footer>
  );
};
BlogFooter.displayName = 'BlogFooter';
