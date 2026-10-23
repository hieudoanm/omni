import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const DestinationGuide: FC<TemplateProps> = ({ data }) => {
  const destination = (data.destination as string) ?? '';
  const highlights = (data.highlights as string[]) ?? [];
  const bestTime = (data.bestTime as string) ?? '';
  const tip = (data.tip as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Destination</span>
      <h1 className='text-base-content mt-1 text-4xl font-bold'>{destination}</h1>
      {bestTime && (
        <span className='rounded-box bg-accent/10 text-accent mt-3 inline-block self-start px-3 py-0.5 text-xs font-bold'>
          Best time: {bestTime}
        </span>
      )}
      {highlights.length > 0 && (
        <ul className='mt-5 flex flex-col gap-4'>
          {highlights.map((h, i) => (
            <li key={i} className='flex items-start gap-4'>
              <span className='text-accent mt-0.5 text-xs'>✦</span>
              <p className='text-base-content text-sm'>{h}</p>
            </li>
          ))}
        </ul>
      )}
      {tip && (
        <div className='border-accent/20 mt-6 border-t pt-4'>
          <span className='text-accent text-xs font-bold tracking-widest uppercase'>Tip</span>
          <p className='text-neutral mt-1 text-xs'>{tip}</p>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

DestinationGuide.displayName = 'DestinationGuide';
