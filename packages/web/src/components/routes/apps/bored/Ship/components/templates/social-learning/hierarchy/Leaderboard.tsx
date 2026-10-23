import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface Entry {
  rank: number;
  name: string;
  score: string;
  medal?: string;
}

const DEFAULT_MEDALS = ['🥇', '🥈', '🥉'];

export const Leaderboard: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Leaderboard';
  const entries = (data.entries as Entry[]) ?? [
    { rank: 1, name: 'Alice', score: '2,450' },
    { rank: 2, name: 'Bob', score: '2,120' },
    { rank: 3, name: 'Carol', score: '1,890' },
    { rank: 4, name: 'Dave', score: '1,650' },
    { rank: 5, name: 'Eve', score: '1,420' },
  ];
  const citation = (data.citation as string) ?? '';

  return (
    <Background>
      <div className='flex w-full flex-col gap-4'>
        <Header title={title} />
        <div className='overflow-x-auto'>
          <table className='table-zebra table'>
            <tbody>
              {entries.map((entry) => {
                const medal =
                  entry.medal ?? (entry.rank <= 3 ? DEFAULT_MEDALS[entry.rank - 1] : undefined);

                return (
                  <tr key={entry.rank}>
                    <td className='text-neutral w-6 text-right text-sm font-bold'>{entry.rank}</td>
                    {medal && <td className='text-sm'>{medal}</td>}
                    <td className='text-base-content text-sm font-bold'>{entry.name}</td>
                    <td className='text-primary text-sm font-bold'>{entry.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

Leaderboard.displayName = 'Leaderboard';
