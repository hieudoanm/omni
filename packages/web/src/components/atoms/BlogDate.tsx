import { FC } from 'react';

interface BlogDateProps {
  date: string;
  format?: 'short' | 'long' | 'relative';
}

const formatRelative = (dateStr: string): string => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const days = Math.floor(diff / 86400000);

  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};

const formatLong = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatShort = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const BlogDate: FC<BlogDateProps> = ({ date, format: fmt = 'short' }) => {
  const label: string =
    fmt === 'long'
      ? formatLong(date)
      : fmt === 'relative'
        ? formatRelative(date)
        : formatShort(date);

  return (
    <time dateTime={date} className='text-base-content/40 text-xs'>
      {label}
    </time>
  );
};

BlogDate.displayName = 'BlogDate';
