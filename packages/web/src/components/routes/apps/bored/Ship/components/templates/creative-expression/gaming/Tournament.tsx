import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Result {
  position: string;
  team: string;
  score: string;
}

const medals: Record<string, string> = {
  '1': '🥇',
  '2': '🥈',
  '3': '🥉',
};

export const Tournament: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Tournament Results';
  const game = (data.game as string) ?? 'Game Title';
  const date = (data.date as string) ?? 'Jan 1, 2026';
  const results =
    (data.results as Result[]) ??
    ([
      { position: '1', team: 'Team Alpha', score: '16' },
      { position: '2', team: 'Team Beta', score: '12' },
    ] as Result[]);

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-0.5 flex items-center gap-1'>
        <span className='text-accent text-lg font-extrabold'>{title}</span>
      </div>
      <div className='mb-2 flex items-center gap-1'>
        <span className='bg-accent/10 text-accent rounded-full px-3 py-0.5 text-xs font-bold'>
          {game}
        </span>
        <time className='text-base-300 text-xs'>{date}</time>
      </div>
      <ul className='flex flex-1 flex-col gap-2'>
        {results.map((result, i) => (
          <li key={i} className='bg-base-200 flex items-center rounded-lg px-2 py-2'>
            <span className='mr-1.5 text-xs'>
              {medals[result.position] ?? `#${result.position}`}
            </span>
            <span className='text-base-content flex-1 text-xs font-bold'>{result.team}</span>
            <span className='text-primary text-xs font-extrabold'>{result.score}</span>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

Tournament.displayName = 'Tournament';
