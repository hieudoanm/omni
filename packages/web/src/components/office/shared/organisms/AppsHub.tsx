'use client';

import Link from 'next/link';
import { ComponentType, FC } from 'react';

export interface CourseItem {
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
}

export interface AppsHubProps {
  title: string;
  description: string;
  items: CourseItem[];
}

export const AppsHub: FC<AppsHubProps> = ({ title, description, items }) => (
  <main className='bg-base-100 flex flex-col items-center justify-center gap-8 p-4 sm:p-6'>
    <div className='text-center'>
      <h1 className='text-primary font-serif text-4xl font-bold tracking-tight'>{title}</h1>
      <p className='text-base-content/60 mt-2 text-sm'>{description}</p>
    </div>
    <div className='grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map(({ label, description: itemDescription, icon: Icon, href }) => (
        <Link
          key={href}
          href={href}
          data-testid={`tool-card-${href.replace('/apps/office', '').replaceAll('/', '')}`}
          className='card bg-base-200 border-base-content/10 hover:border-primary border transition-colors'>
          <div className='card-body items-center gap-2 text-center'>
            <Icon className='text-primary text-4xl' />
            <h2 className='card-title text-lg'>{label}</h2>
            <p className='text-base-content/60 text-xs'>{itemDescription}</p>
          </div>
        </Link>
      ))}
    </div>
  </main>
);
