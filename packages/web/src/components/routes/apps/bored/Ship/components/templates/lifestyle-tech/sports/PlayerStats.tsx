import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const PlayerStats: FC<TemplateProps> = ({ data }) => {
  const name = (data.name as string) ?? 'Marcus Johnson';
  const team = (data.team as string) ?? 'City FC';
  const position = (data.position as string) ?? 'Forward';
  const stats = (data.stats as { label: string; value: string }[]) ?? [
    { label: 'Goals', value: '24' },
    { label: 'Assists', value: '12' },
    { label: 'Matches', value: '38' },
    { label: 'Rating', value: '8.7' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex w-full flex-col gap-4'>
        <div className='mb-6 text-center'>
          <h1 className='text-base-content text-4xl font-black'>{name}</h1>
          <div className='mt-1 flex items-center justify-center gap-2'>
            <span className='text-accent text-xs font-bold'>{team}</span>
            <span className='text-neutral text-xs'>·</span>
            <span className='text-neutral text-xs'>{position}</span>
          </div>
        </div>

        <ul className='grid w-full grid-cols-2 gap-3'>
          {stats.map((s, i) => (
            <li key={i} className='bg-base-200 rounded-box flex flex-col items-center py-4'>
              <span className='text-accent text-3xl font-black'>{s.value}</span>
              <span className='text-neutral mt-1 text-xs font-bold uppercase'>{s.label}</span>
            </li>
          ))}
        </ul>
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

PlayerStats.displayName = 'PlayerStats';
