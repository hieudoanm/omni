'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';
import { PiGear, PiHouse } from 'react-icons/pi';

const LINKS: {
  href: string;
  label: string;
  icon: FC<{ className?: string; size?: number }>;
}[] = [
  { href: '/apps', label: 'Home', icon: PiHouse },
  { href: '/apps/version', label: 'Version', icon: PiGear },
];

export const LeftSidebar: FC = () => {
  const pathname = usePathname();

  return (
    <div className='bg-base-200 flex w-12 flex-col items-center gap-2 py-2'>
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active =
          href === '/apps'
            ? pathname === '/apps'
            : pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));

        return (
          <div key={href} className='tooltip tooltip-primary tooltip-right' data-tip={label}>
            <Link
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`btn btn-ghost btn-square btn-sm ${
                active ? 'bg-primary/20 text-primary' : 'text-base-content/60'
              }`}>
              <Icon className='h-5 w-5' />
            </Link>
          </div>
        );
      })}
    </div>
  );
};

LeftSidebar.displayName = 'LeftSidebar';
