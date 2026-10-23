'use client';

import { FC } from 'react';
import { CalendarApp } from '@/components/office/calendar/organisms/CalendarApp';

const CalendarPage: FC = () => (
  <main className='bg-base-100 flex flex-col items-center justify-center gap-6 p-4 sm:p-6'>
    <CalendarApp />
  </main>
);

export default CalendarPage;
