import type { Event } from '@/data/office/calendar/events';
import { FC } from 'react';

export const EventList: FC<{ events: Event[] }> = ({ events }) => (
  <div className='px-4 py-3'>
    <p className='text-base-content/40 mb-2 text-[10px] font-normal tracking-widest uppercase'>
      Events
    </p>
    {events.length === 0 ? (
      <p className='text-base-content/25 text-xs'>No events on this date.</p>
    ) : (
      <div className='flex flex-col gap-2'>
        {events.map((event) => (
          <div
            key={event.title}
            className='bg-base-content/5 border-base-content/10 rounded-lg border px-2 py-1.5 text-[11px] leading-snug'>
            <p className='text-base-content font-normal'>{event.title}</p>
            <p className='text-base-content/50 mt-0.5 text-[10px]'>{event.field}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);
EventList.displayName = 'EventList';
