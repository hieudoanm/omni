import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Leader {
  position: number;
  name: string;
  team: string;
  value: number;
}

export const SeasonStats: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Season Stats';
  const text = (data.text as string) ?? '';
  const leaders = (data.leaders as Leader[]) ?? [
    { position: 1, name: 'Player A', team: 'Team Alpha', value: 24 },
    { position: 2, name: 'Player B', team: 'Team Beta', value: 19 },
    { position: 3, name: 'Player C', team: 'Team Gamma', value: 17 },
    { position: 4, name: 'Player D', team: 'Team Delta', value: 15 },
    { position: 5, name: 'Player E', team: 'Team Epsilon', value: 13 },
  ];

  const maxVal = Math.max(...leaders.map((l) => l.value), 1);

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-5 text-center'>
        <h2 className='text-base-content text-base font-bold'>{title}</h2>
        {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
      </div>

      <ul className='flex flex-1 flex-col justify-center gap-4'>
        {leaders.map((l, i) => (
          <li key={i} className='flex items-center gap-3'>
            <span className='text-accent w-6 text-right text-xs font-black'>{l.position}</span>
            <div className='flex flex-1 flex-col'>
              <div className='flex items-center justify-between'>
                <span className='text-base-content text-base font-semibold'>{l.name}</span>
                <span className='text-accent text-base font-black'>{l.value}</span>
              </div>
              <span className='text-neutral text-xs'>{l.team}</span>
              <div className='bg-neutral/20 mt-1 h-1.5 w-full overflow-hidden rounded-full'>
                <div
                  className='bg-accent h-full rounded-full'
                  style={{ width: `${(l.value / maxVal) * 100}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

SeasonStats.displayName = 'SeasonStats';
