import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Season: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Season Overview';
  const season = (data.season as string) ?? 'Spring 2025';
  const city = (data.city as string) ?? 'Paris';
  const avgTemp = (data.avgTemp as string) ?? '16°C';
  const rainfall = (data.rainfall as string) ?? '48 mm';
  const daylight = (data.daylight as string) ?? '14.5 hrs';
  const highlights = (data.highlights as string[]) ?? [
    'Cherry blossoms peak in early April',
    'Mild temperatures ideal for walking',
    'Occasional spring showers',
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase'>{title}</h2>
      <h1 className='text-base-content text-4xl font-bold'>{season}</h1>
      <span className='text-neutral text-xs'>{city}</span>

      <div className='mt-2 grid grid-cols-3 gap-1'>
        <div className='bg-base-200 rounded-2xl p-1 text-center'>
          <span className='text-accent text-xs font-black'>{avgTemp}</span>
          <span className='text-neutral mt-1 block text-xs font-bold tracking-[0.15em] uppercase'>
            Avg Temp
          </span>
        </div>
        <div className='bg-base-200 rounded-2xl p-1 text-center'>
          <span className='text-accent text-xs font-black'>{rainfall}</span>
          <span className='text-neutral mt-1 block text-xs font-bold tracking-[0.15em] uppercase'>
            Rainfall
          </span>
        </div>
        <div className='bg-base-200 rounded-2xl p-1 text-center'>
          <span className='text-accent text-xs font-black'>{daylight}</span>
          <span className='text-neutral mt-1 block text-xs font-bold tracking-[0.15em] uppercase'>
            Daylight
          </span>
        </div>
      </div>

      <div className='mt-2'>
        <span className='text-neutral text-xs font-bold tracking-[0.15em] uppercase'>
          Highlights
        </span>
        <ul className='mt-2 flex flex-col gap-1'>
          {highlights.map((h, i) => (
            <li key={i} className='flex items-start gap-1'>
              <span className='bg-accent mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full' />
              <span className='text-base-content text-xs leading-relaxed'>{h}</span>
            </li>
          ))}
        </ul>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Season.displayName = 'Season';
