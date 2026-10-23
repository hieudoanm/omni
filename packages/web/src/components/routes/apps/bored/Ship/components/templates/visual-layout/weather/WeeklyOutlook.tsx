import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface DayForecast {
  day: string;
  high: string;
  low: string;
  condition: string;
}

export const WeeklyOutlook: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Weekly Outlook';
  const city = (data.city as string) ?? 'Tokyo';
  const days = (data.days as DayForecast[]) ?? [
    { day: 'Mon', high: '22°', low: '15°', condition: 'Sunny' },
    { day: 'Tue', high: '20°', low: '14°', condition: 'Cloudy' },
    { day: 'Wed', high: '18°', low: '13°', condition: 'Rain' },
    { day: 'Thu', high: '21°', low: '14°', condition: 'Partly Cloudy' },
    { day: 'Fri', high: '24°', low: '16°', condition: 'Sunny' },
    { day: 'Sat', high: '23°', low: '15°', condition: 'Sunny' },
    { day: 'Sun', high: '19°', low: '12°', condition: 'Showers' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase'>{title}</h2>
      <h1 className='text-base-content text-4xl font-bold'>{city}</h1>

      <ul className='mt-6 flex flex-col gap-1'>
        {days.map((d, i) => (
          <li key={i} className='flex items-center justify-between border-b border-[#e5e7eb] pb-2'>
            <span className='text-base-content w-10 text-xs font-semibold'>{d.day}</span>
            <span className='text-neutral flex-1 text-center text-xs'>{d.condition}</span>
            <div className='flex items-center gap-3'>
              <span className='text-accent text-xs font-bold'>{d.high}</span>
              <span className='text-neutral text-xs'>{d.low}</span>
            </div>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

WeeklyOutlook.displayName = 'WeeklyOutlook';
