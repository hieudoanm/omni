import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Stat {
  label: string;
  value: string;
}

export const StatTracker: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Season Stats';
  const game = (data.game as string) ?? 'Game Title';
  const stats =
    (data.stats as Stat[]) ??
    ([
      { label: 'Wins', value: '142' },
      { label: 'Losses', value: '38' },
    ] as Stat[]);
  const highlight = (data.highlight as string) ?? 'Top 1%';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-0.5 text-4xl font-bold'>{title}</h1>
      <p className='text-neutral mb-2 text-xs font-medium'>{game}</p>
      <ul className='mb-3 grid w-full grid-cols-2 gap-2'>
        {stats.map((stat, i) => (
          <li key={i} className='bg-base-200 rounded-lg px-2 py-2'>
            <p className='text-primary text-lg font-extrabold'>{stat.value}</p>
            <p className='text-base-300 mt-0.5 text-xs font-semibold tracking-wider uppercase'>
              {stat.label}
            </p>
          </li>
        ))}
      </ul>
      <span className='bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-bold'>
        {highlight}
      </span>
      <Footer citation={citation} />
    </Background>
  );
};

StatTracker.displayName = 'StatTracker';
