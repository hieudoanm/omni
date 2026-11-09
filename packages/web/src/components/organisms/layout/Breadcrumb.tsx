'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';

const LABEL_OVERRIDES: Record<string, string> = {
  md: 'Markdown',
};

const toLabel = (segment: string): string =>
  LABEL_OVERRIDES[segment] ??
  segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

interface Crumb {
  label: string;
  href?: string;
}

const toCrumbs = (pathname: string): Crumb[] => {
  const segments = pathname.split('/').filter(Boolean);
  return [
    { label: 'Home', href: '/' },
    ...segments.map((segment, i) => ({
      label: toLabel(segment),
      href: i < segments.length - 1 ? `/${segments.slice(0, i + 1).join('/')}` : undefined,
    })),
  ];
};

export const Breadcrumb: FC = () => {
  const pathname = usePathname();
  const crumbs = toCrumbs(pathname ?? '/');

  return (
    <nav aria-label='Breadcrumb' className='border-base-300 border-t px-4 py-2 text-xs'>
      <div className='flex flex-wrap items-center gap-2'>
        {crumbs.map(({ label, href }, i) => (
          <span key={label} className='flex items-center gap-2'>
            {i > 0 && <span className='text-base-content/30'>/</span>}
            {href ? (
              <Link href={href} className='text-neutral-500 transition-colors hover:text-amber-400'>
                {label}
              </Link>
            ) : (
              <span className='text-neutral-300'>{label}</span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
};

Breadcrumb.displayName = 'Breadcrumb';
