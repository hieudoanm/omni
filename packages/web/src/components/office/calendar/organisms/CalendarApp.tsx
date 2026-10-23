'use client';

import { FC, useMemo, useState } from 'react';
import { LunarCalendar } from '@/lib/lodashx';

import { MonthCalendar } from '@/components/office/calendar/molecules/MonthCalendar';
import { WeekView } from '@/components/office/calendar/molecules/WeekView';
import { DayView } from '@/components/office/calendar/molecules/DayView';
import { ThreeDayView } from '@/components/office/calendar/molecules/ThreeDayView';
import { QuarterlyView } from '@/components/office/calendar/molecules/QuarterlyView';
import { HalflyView } from '@/components/office/calendar/molecules/HalflyView';
import { YearlyView } from '@/components/office/calendar/molecules/YearlyView';
import { LunarDate } from '@/components/office/calendar/atoms/LunarDate';
import { EventList } from '@/components/office/calendar/atoms/EventList';
import { DaysCountModal } from '@/components/office/calendar/organisms/DaysCountModal';
import { CountdownModal } from '@/components/office/calendar/organisms/CountdownModal';
import { View, years, months } from '@/data/office/calendar/constants';
import { events } from '@/data/office/calendar/events';

const lunarCalendar = new LunarCalendar();

const VIEW_LABELS: Record<View, string> = {
  [View.DAY]: 'Day',
  [View.THREE_DAY]: '3 Days',
  [View.WEEK]: 'Week',
  [View.MONTH]: 'Month',
  [View.QUARTERLY]: 'Quarter',
  [View.HALFLY]: 'Half',
  [View.YEARLY]: 'Year',
};

const getEventsForDate = (date: Date) =>
  events.filter(({ year, month, date: d, frequency }) => {
    const yearMatch = year === 0 || frequency === 'annual' || year === date.getFullYear();
    const monthMatch = month === 0 || month === date.getMonth() + 1;
    const dateMatch = d === 0 || d === date.getDate();
    return yearMatch && monthMatch && dateMatch;
  });

export const CalendarApp: FC = () => {
  const today = new Date();
  const [state, setState] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
    weekStart: getWeekStart(today),
    view: View.MONTH,
  });
  const [chosenDate, setChosenDate] = useState(today);

  const chosenEvents = useMemo(() => getEventsForDate(chosenDate), [chosenDate]);

  const lunarResult = useMemo(() => {
    const result = lunarCalendar.solar2lunar(
      chosenDate.getFullYear(),
      chosenDate.getMonth() + 1,
      chosenDate.getDate(),
    );
    return result === -1 ? null : result;
  }, [chosenDate]);

  const handlePrev = () => {
    setState((prev) => {
      if (prev.view === View.MONTH || prev.view === View.DAY || prev.view === View.THREE_DAY) {
        const newMonth = prev.month === 0 ? 11 : prev.month - 1;
        const newYear = prev.month === 0 ? prev.year - 1 : prev.year;
        return { ...prev, month: newMonth, year: newYear };
      }
      if (prev.view === View.WEEK) {
        const d = new Date(prev.weekStart);
        d.setDate(d.getDate() - 7);
        return {
          ...prev,
          weekStart: d,
          year: d.getFullYear(),
          month: d.getMonth(),
        };
      }
      if (prev.view === View.QUARTERLY) {
        const newMonth = prev.month < 3 ? prev.month + 9 : prev.month - 3;
        const newYear = prev.month < 3 ? prev.year - 1 : prev.year;
        return { ...prev, month: newMonth, year: newYear };
      }
      if (prev.view === View.HALFLY) {
        const newMonth = prev.month < 6 ? prev.month + 6 : prev.month - 6;
        const newYear = prev.month < 6 ? prev.year - 1 : prev.year;
        return { ...prev, month: newMonth, year: newYear };
      }
      return { ...prev, year: prev.year - 1 };
    });
  };

  const handleNext = () => {
    setState((prev) => {
      if (prev.view === View.MONTH || prev.view === View.DAY || prev.view === View.THREE_DAY) {
        const newMonth = prev.month === 11 ? 0 : prev.month + 1;
        const newYear = prev.month === 11 ? prev.year + 1 : prev.year;
        return { ...prev, month: newMonth, year: newYear };
      }
      if (prev.view === View.WEEK) {
        const d = new Date(prev.weekStart);
        d.setDate(d.getDate() + 7);
        return {
          ...prev,
          weekStart: d,
          year: d.getFullYear(),
          month: d.getMonth(),
        };
      }
      if (prev.view === View.QUARTERLY) {
        const newMonth = prev.month >= 9 ? prev.month - 9 : prev.month + 3;
        const newYear = prev.month >= 9 ? prev.year + 1 : prev.year;
        return { ...prev, month: newMonth, year: newYear };
      }
      if (prev.view === View.HALFLY) {
        const newMonth = prev.month >= 6 ? prev.month - 6 : prev.month + 6;
        const newYear = prev.month >= 6 ? prev.year + 1 : prev.year;
        return { ...prev, month: newMonth, year: newYear };
      }
      return { ...prev, year: prev.year + 1 };
    });
  };

  const handleToday = () => {
    const t = new Date();
    setState({
      year: t.getFullYear(),
      month: t.getMonth(),
      weekStart: getWeekStart(t),
      view: state.view,
    });
    setChosenDate(t);
  };

  const handleViewChange = (view: View) => {
    setState((prev) => ({ ...prev, view }));
  };

  const handleMonthSelect = (month: number) => {
    setState((prev) => ({ ...prev, month, year: prev.year }));
  };

  const handleYearSelect = (year: number) => {
    setState((prev) => ({ ...prev, year }));
  };

  const headerLabel =
    state.view === View.WEEK
      ? formatWeekRange(state.weekStart)
      : state.view === View.QUARTERLY
        ? `Q${Math.floor(state.month / 3) + 1} ${state.year}`
        : state.view === View.HALFLY
          ? `H${state.month < 6 ? 1 : 2} ${state.year}`
          : state.view === View.YEARLY
            ? `${state.year}`
            : `${months[state.month]} ${state.year}`;

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <nav className='border-base-content/10 flex items-center gap-2 border-b px-4 py-2'>
        <button className='btn btn-sm btn-ghost' onClick={handleToday} data-testid='nav-today'>
          Today
        </button>
        <button className='btn btn-sm btn-ghost btn-square' onClick={handlePrev}>
          ‹
        </button>
        <button className='btn btn-sm btn-ghost btn-square' onClick={handleNext}>
          ›
        </button>
        <h2 className='text-base-content mr-auto text-lg font-semibold'>{headerLabel}</h2>
        <DaysCountModal />
        <CountdownModal />
        {(state.view === View.DAY ||
          state.view === View.THREE_DAY ||
          state.view === View.MONTH ||
          state.view === View.QUARTERLY ||
          state.view === View.HALFLY) && (
          <select
            className='select select-sm select-bordered border-base-content/10 bg-base-100 text-base-content'
            value={state.month}
            onChange={(e) => handleMonthSelect(Number(e.target.value))}>
            {months.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        )}
        {(state.view === View.MONTH ||
          state.view === View.QUARTERLY ||
          state.view === View.HALFLY ||
          state.view === View.YEARLY) && (
          <select
            className='select select-sm select-bordered border-base-content/10 bg-base-100 text-base-content'
            value={state.year}
            onChange={(e) => handleYearSelect(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
        <div className='dropdown dropdown-end'>
          <div tabIndex={0} role='button' className='btn btn-sm btn-ghost'>
            {VIEW_LABELS[state.view]}
          </div>
          <ul
            tabIndex={-1}
            className='menu dropdown-content border-base-content/10 bg-base-100 rounded-box z-50 mt-1 w-40 border shadow-lg'>
            {Object.values(View).map((v) => (
              <li key={v}>
                <a className={state.view === v ? 'active' : ''} onClick={() => handleViewChange(v)}>
                  {VIEW_LABELS[v]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className='flex-1 overflow-auto'>
        {state.view === View.MONTH && (
          <>
            <MonthCalendar
              year={state.year}
              month={state.month}
              chosenDate={chosenDate}
              onDateSelect={setChosenDate}
              events={events}
            />
            <div className='border-base-content/10 border-t' />
            <LunarDate
              chosenDate={chosenDate}
              lunarDay={lunarResult?.lDay ?? null}
              lunarMonth={lunarResult?.lMonth ?? null}
              lunarYear={lunarResult?.lYear ?? null}
            />
            <div className='border-base-content/10 border-t' />
            <EventList events={chosenEvents} />
          </>
        )}
        {state.view === View.WEEK && <WeekView year={state.year} weekStart={state.weekStart} />}
        {state.view === View.DAY && (
          <DayView year={state.year} month={state.month} day={today.getDate()} />
        )}
        {state.view === View.THREE_DAY && (
          <ThreeDayView year={state.year} month={state.month} day={today.getDate()} />
        )}
        {state.view === View.QUARTERLY && <QuarterlyView year={state.year} month={state.month} />}
        {state.view === View.HALFLY && <HalflyView year={state.year} month={state.month} />}
        {state.view === View.YEARLY && <YearlyView year={state.year} />}
      </div>
    </div>
  );
};
CalendarApp.displayName = 'CalendarApp';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const sm = months[start.getMonth()].slice(0, 3);
  const em = months[end.getMonth()].slice(0, 3);
  if (start.getMonth() === end.getMonth()) {
    return `${sm} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${sm} ${start.getDate()} – ${em} ${end.getDate()}, ${end.getFullYear()}`;
}
