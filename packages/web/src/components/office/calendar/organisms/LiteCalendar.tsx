'use client';

import { FC, useState } from 'react';
import { MonthCalendar } from '@/components/office/calendar/molecules/MonthCalendar';
import { months, years } from '@/data/office/calendar/constants';
import { events } from '@/data/office/calendar/events';

export const LiteCalendar: FC = () => {
  const today = new Date();
  const [state, setState] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [chosenDate, setChosenDate] = useState(today);

  const handlePrev = (): void => {
    setState((prev) =>
      prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 },
    );
  };

  const handleNext = (): void => {
    setState((prev) =>
      prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 },
    );
  };

  const handleToday = (): void => {
    const t = new Date();
    setState({ year: t.getFullYear(), month: t.getMonth() });
    setChosenDate(t);
  };

  return (
    <div className='flex w-full max-w-2xl flex-1 flex-col overflow-hidden'>
      <nav className='border-base-content/10 flex items-center gap-2 border-b px-4 py-2'>
        <button className='btn btn-sm btn-ghost' onClick={handleToday} data-testid='nav-today'>
          Today
        </button>
        <button
          className='btn btn-sm btn-ghost btn-square'
          aria-label='Previous month'
          onClick={handlePrev}>
          ‹
        </button>
        <button
          className='btn btn-sm btn-ghost btn-square'
          aria-label='Next month'
          onClick={handleNext}>
          ›
        </button>
        <h2
          className='text-base-content mr-auto text-lg font-semibold'
          data-testid='calendar-heading'>
          {months[state.month]} {state.year}
        </h2>
        <select
          aria-label='Month'
          className='select select-sm select-bordered border-base-content/10 bg-base-100 text-base-content'
          value={state.month}
          onChange={(event) =>
            setState((prev) => ({
              ...prev,
              month: Number(event.target.value),
            }))
          }>
          {months.map((name, index) => (
            <option key={name} value={index}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label='Year'
          className='select select-sm select-bordered border-base-content/10 bg-base-100 text-base-content'
          value={state.year}
          onChange={(event) =>
            setState((prev) => ({
              ...prev,
              year: Number(event.target.value),
            }))
          }>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </nav>
      <div className='min-h-0 flex-1 overflow-auto'>
        <MonthCalendar
          year={state.year}
          month={state.month}
          chosenDate={chosenDate}
          onDateSelect={setChosenDate}
          events={events}
        />
      </div>
    </div>
  );
};
LiteCalendar.displayName = 'LiteCalendar';
