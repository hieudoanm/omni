import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const SunriseSunset: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Sunrise & Sunset';
  const city = (data.city as string) ?? 'Barcelona';
  const sunrise = (data.sunrise as string) ?? '06:42';
  const sunset = (data.sunset as string) ?? '21:18';
  const daylight = (data.daylight as string) ?? '14h 36m';
  const goldenHour = (data.goldenHour as string) ?? '20:32 – 21:05';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase'>{title}</h2>
      <h1 className='text-base-content text-4xl font-bold'>{city}</h1>

      <div className='mt-3 flex items-center gap-4'>
        <div className='text-center'>
          <time className='text-accent text-xs font-black'>{sunrise}</time>
          <span className='text-neutral mt-1 block text-xs font-bold tracking-[0.15em] uppercase'>
            Sunrise
          </span>
        </div>
        <div className='bg-neutral/20 h-px w-12' />
        <div className='text-center'>
          <time className='text-accent text-xs font-black'>{sunset}</time>
          <span className='text-neutral mt-1 block text-xs font-bold tracking-[0.15em] uppercase'>
            Sunset
          </span>
        </div>
      </div>

      <div className='bg-base-200 mt-3 flex gap-3 rounded-2xl px-3 py-1'>
        <div className='text-center'>
          <span className='text-neutral text-xs font-bold tracking-[0.15em] uppercase'>
            Daylight
          </span>
          <span className='text-base-content mt-1 block text-xs font-semibold'>{daylight}</span>
        </div>
        <div className='text-center'>
          <span className='text-neutral text-xs font-bold tracking-[0.15em] uppercase'>
            Golden Hour
          </span>
          <span className='text-base-content mt-1 block text-xs font-semibold'>{goldenHour}</span>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

SunriseSunset.displayName = 'SunriseSunset';
