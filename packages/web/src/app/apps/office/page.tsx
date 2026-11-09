'use client';

import { AppsHub, type CourseItem } from '@/components/office/shared/organisms/AppsHub';
import { AppsComparison } from '@/components/office/shared/organisms/AppsComparison';
import { NextPage } from 'next';
import {
  PiCalendarBlank,
  PiListChecks,
  PiMarkdownLogo,
  PiPresentation,
  PiTable,
} from 'react-icons/pi';

const ITEMS: CourseItem[] = [
  {
    label: 'Calendar',
    description: 'A calendar productivity app with multiple calendar views',
    icon: PiCalendarBlank,
    href: '/apps/office/calendar/',
  },
  {
    label: 'CSV',
    description: 'A minimal spreadsheet editor for CSV files',
    icon: PiTable,
    href: '/apps/office/csv/',
  },
  {
    label: 'Markdown',
    description: 'A minimal Obsidian-style markdown knowledge base',
    icon: PiMarkdownLogo,
    href: '/apps/office/md/',
  },
  {
    label: 'Tasks',
    description: 'A full kanban board for planning and tracking work',
    icon: PiListChecks,
    href: '/apps/office/tasks/',
  },
  {
    label: 'Keynotes',
    description: 'An offline-first presentation editor for slides and decks',
    icon: PiPresentation,
    href: '/apps/office/keynotes/',
  },
];

const HomePage: NextPage = () => {
  return (
    <div className='flex h-full flex-col'>
      <AppsHub
        title='Office'
        description='A suite of productivity tools for planning your work'
        items={ITEMS}
      />
      <AppsComparison />
    </div>
  );
};

export default HomePage;
