'use client';

import { AppsHub, type CourseItem } from '@/components/office/shared/organisms/AppsHub';
import { NextPage } from 'next';
import { PiCalendarBlank, PiListChecks, PiMarkdownLogo, PiTable } from 'react-icons/pi';

const ITEMS: CourseItem[] = [
  {
    label: 'Calendar',
    description: 'A lite calendar with essential monthly views',
    icon: PiCalendarBlank,
    href: '/apps/office/lite/calendar',
  },
  {
    label: 'CSV',
    description: 'A lite spreadsheet editor for CSV files',
    icon: PiTable,
    href: '/apps/office/lite/csv',
  },
  {
    label: 'Markdown',
    description: 'A lite markdown editor with live preview',
    icon: PiMarkdownLogo,
    href: '/apps/office/lite/md',
  },
  {
    label: 'Tasks',
    description: 'A lite to-do list for quick task tracking',
    icon: PiListChecks,
    href: '/apps/office/lite/tasks',
  },
];

const LiteHomePage: NextPage = () => {
  return (
    <AppsHub
      title='Lite'
      description='Lightweight versions of your favorite productivity tools'
      items={ITEMS}
    />
  );
};

export default LiteHomePage;
