import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Forecast: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? "Today's Weather";
  const city = (data.city as string) ?? 'London';
  const temp = (data.temp as string) ?? '18°C';
  const condition = (data.condition as string) ?? 'Partly Cloudy';
  const high = (data.high as string) ?? '21°C';
  const low = (data.low as string) ?? '14°C';
  const humidity = (data.humidity as string) ?? '62%';
  const wind = (data.wind as string) ?? '12 km/h';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase'>{title}</h2>
      <h1 className='text-base-content text-4xl font-bold'>{city}</h1>

      <div className='mt-3 text-center'>
        <span className='text-accent text-3xl font-black'>{temp}</span>
        <span className='text-neutral mt-2 block text-xs'>{condition}</span>
      </div>

      <div className='mt-3 flex gap-3'>
        <div className='text-center'>
          <span className='text-neutral text-xs font-bold tracking-[0.15em] uppercase'>High</span>
          <span className='text-base-content mt-1 block text-xs font-semibold'>{high}</span>
        </div>
        <div className='text-center'>
          <span className='text-neutral text-xs font-bold tracking-[0.15em] uppercase'>Low</span>
          <span className='text-base-content mt-1 block text-xs font-semibold'>{low}</span>
        </div>
      </div>

      <div className='bg-base-200 mt-3 flex gap-4 rounded-2xl px-3 py-1'>
        <div className='text-center'>
          <span className='text-neutral text-xs font-bold tracking-[0.15em] uppercase'>
            Humidity
          </span>
          <span className='text-base-content mt-1 block text-xs font-semibold'>{humidity}</span>
        </div>
        <div className='text-center'>
          <span className='text-neutral text-xs font-bold tracking-[0.15em] uppercase'>Wind</span>
          <span className='text-base-content mt-1 block text-xs font-semibold'>{wind}</span>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Forecast.displayName = 'Forecast';
