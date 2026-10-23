'use client';

import { FC } from 'react';
import { LiteCalendar } from '@/components/office/calendar/organisms/LiteCalendar';

const LiteCalendarPage: FC = () => (
  <main className='bg-base-100 flex flex-col items-center justify-center gap-6 p-4 sm:p-6'>
    <LiteCalendar />
  </main>
);

export default LiteCalendarPage;
