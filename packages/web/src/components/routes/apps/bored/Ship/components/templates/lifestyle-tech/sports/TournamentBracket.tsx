import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Match {
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  winner?: string;
}

interface Round {
  name: string;
  matches: Match[];
}

export const TournamentBracket: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Tournament Bracket';
  const text = (data.text as string) ?? '';
  const rounds = (data.rounds as Round[]) ?? [
    {
      name: 'Quarter-Finals',
      matches: [
        {
          teamA: 'Team A',
          teamB: 'Team H',
          scoreA: 3,
          scoreB: 1,
          winner: 'Team A',
        },
        {
          teamA: 'Team B',
          teamB: 'Team G',
          scoreA: 2,
          scoreB: 2,
          winner: 'Team B',
        },
      ],
    },
    {
      name: 'Semi-Finals',
      matches: [
        {
          teamA: 'Team A',
          teamB: 'Team D',
          scoreA: 2,
          scoreB: 0,
          winner: 'Team A',
        },
        {
          teamA: 'Team B',
          teamB: 'Team C',
          scoreA: 1,
          scoreB: 3,
          winner: 'Team C',
        },
      ],
    },
    {
      name: 'Final',
      matches: [
        {
          teamA: 'Team A',
          teamB: 'Team C',
          scoreA: 2,
          scoreB: 1,
          winner: 'Team A',
        },
      ],
    },
  ];

  const renderTeam = (name: string, score?: number, isWinner?: boolean) => (
    <div
      className={`flex items-center justify-between px-3 py-1.5 ${isWinner ? 'bg-accent/10' : ''}`}>
      <span className={`text-xs ${isWinner ? 'text-accent font-bold' : 'text-base-content'}`}>
        {name}
      </span>
      {score !== undefined && (
        <span className={`text-xs ${isWinner ? 'text-accent font-bold' : 'text-neutral'}`}>
          {score}
        </span>
      )}
    </div>
  );

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-4 text-center'>
        <h2 className='text-base-content text-base font-bold'>{title}</h2>
        {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
      </div>

      <ul className='flex flex-1 items-start justify-center gap-4'>
        {rounds.map((round, ri) => (
          <li key={ri} className='flex flex-col items-center gap-2'>
            <div className='text-neutral mb-2 text-xs font-semibold tracking-wider uppercase'>
              {round.name}
            </div>
            <ul className='flex flex-col gap-3'>
              {round.matches.map((m, mi) => (
                <li key={mi} className='border-base-300 rounded-box overflow-hidden border'>
                  {renderTeam(m.teamA, m.scoreA, m.winner === m.teamA)}
                  <div className='border-base-300 border-t' />
                  {renderTeam(m.teamB, m.scoreB, m.winner === m.teamB)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

TournamentBracket.displayName = 'TournamentBracket';
