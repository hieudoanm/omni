import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Row {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gd: string;
  points: number;
}

export const LeagueTable: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'League Table';
  const text = (data.text as string) ?? '';
  const standings = (data.standings as Row[]) ?? [
    {
      position: 1,
      team: 'Team A',
      played: 10,
      won: 8,
      drawn: 1,
      lost: 1,
      gd: '+15',
      points: 25,
    },
    {
      position: 2,
      team: 'Team B',
      played: 10,
      won: 7,
      drawn: 2,
      lost: 1,
      gd: '+10',
      points: 23,
    },
    {
      position: 3,
      team: 'Team C',
      played: 10,
      won: 6,
      drawn: 2,
      lost: 2,
      gd: '+5',
      points: 20,
    },
    {
      position: 4,
      team: 'Team D',
      played: 10,
      won: 5,
      drawn: 3,
      lost: 2,
      gd: '+3',
      points: 18,
    },
    {
      position: 5,
      team: 'Team E',
      played: 10,
      won: 4,
      drawn: 2,
      lost: 4,
      gd: '-2',
      points: 14,
    },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-4 text-center'>
        <h2 className='text-base-content text-base font-bold'>{title}</h2>
        {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
      </div>

      <div className='rounded-box border-base-300 flex-1 overflow-hidden border'>
        <ul className='border-base-300 bg-base-200 flex border-b px-4 py-2'>
          <li className='text-neutral w-8 text-xs'>#</li>
          <li className='text-neutral flex-1 text-xs'>Team</li>
          <li className='text-neutral w-7 text-center text-xs'>P</li>
          <li className='text-neutral w-7 text-center text-xs'>W</li>
          <li className='text-neutral w-7 text-center text-xs'>D</li>
          <li className='text-neutral w-7 text-center text-xs'>L</li>
          <li className='text-neutral w-10 text-center text-xs'>GD</li>
          <li className='text-neutral w-10 text-right text-xs'>Pts</li>
        </ul>
        <ul>
          {standings.map((row, i) => (
            <li key={i} className='border-base-300 flex items-center border-b px-4 py-2.5'>
              <span className='text-accent w-8 text-xs font-bold'>{row.position}</span>
              <span className='text-base-content flex-1 text-base font-medium'>{row.team}</span>
              <span className='text-neutral w-7 text-center text-xs'>{row.played}</span>
              <span className='text-neutral w-7 text-center text-xs'>{row.won}</span>
              <span className='text-neutral w-7 text-center text-xs'>{row.drawn}</span>
              <span className='text-neutral w-7 text-center text-xs'>{row.lost}</span>
              <span className='text-neutral w-10 text-center text-xs'>{row.gd}</span>
              <span className='text-base-content w-10 text-right text-xs font-bold'>
                {row.points}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

LeagueTable.displayName = 'LeagueTable';
