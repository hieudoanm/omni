import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface ItineraryItem {
  time: string;
  activity: string;
  location?: string;
}

export const ItineraryDay: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Day Trip';
  const day = (data.day as string) ?? '1';
  const date = (data.date as string) ?? '';
  const items = (data.items as ItineraryItem[]) ?? [
    { time: '09:00', activity: 'Breakfast', location: 'Cafe Mocha' },
    { time: '11:00', activity: 'Museum Visit', location: 'City Museum' },
    { time: '13:00', activity: 'Lunch', location: 'Local Bistro' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mr-6 flex flex-col items-center'>
        <div className='bg-primary text-primary-content flex h-12 w-12 items-center justify-center rounded-full text-base font-black'>
          {day}
        </div>
      </div>
      <div className='flex flex-1 flex-col'>
        {date && <time className='text-neutral mb-0.5 text-xs'>{date}</time>}
        <h1 className='text-base-content mb-4 text-4xl font-bold'>{title}</h1>
        <div className='flex flex-1 flex-col'>
          <ul className='flex flex-1 flex-col'>
            {items.map((item, i) => (
              <li key={i} className='flex items-start gap-4'>
                <div className='flex flex-col items-center'>
                  <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold'>
                    {item.time}
                  </span>
                  {i < items.length - 1 && (
                    <div className='border-base-300 border-l-2' style={{ height: '100%' }} />
                  )}
                </div>
                <div className='mb-3'>
                  <p className='text-base-content text-base font-medium'>{item.activity}</p>
                  {item.location && <p className='text-neutral text-xs'>{item.location}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

ItineraryDay.displayName = 'ItineraryDay';
