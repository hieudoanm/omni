import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Scorer {
  name: string;
  minute: string;
  team: string;
}

interface Stat {
  label: string;
  home: string;
  away: string;
}

export const Scorecard: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Match Result';
  const text = (data.text as string) ?? '';
  const homeTeam = (data.homeTeam as string) ?? 'Home';
  const awayTeam = (data.awayTeam as string) ?? 'Away';
  const homeScore = (data.homeScore as number) ?? 0;
  const awayScore = (data.awayScore as number) ?? 0;
  const date = (data.date as string) ?? '';
  const venue = (data.venue as string) ?? '';
  const scorers = (data.scorers as Scorer[]) ?? [];
  const stats = (data.stats as Stat[]) ?? [
    { label: 'Possession', home: '55%', away: '45%' },
    { label: 'Shots', home: '12', away: '8' },
    { label: 'On Target', home: '5', away: '3' },
  ];

  const citation = (data.citation as string) ?? '';

  const homeScorers = scorers.filter((s) => s.team === 'home');
  const awayScorers = scorers.filter((s) => s.team === 'away');

  return (
    <Background>
      <div className='grid grid-cols-3 gap-y-2'>
        {/* Title */}
        <div className='col-span-3 mb-2 text-center'>
          <h2 className='text-neutral text-xs font-semibold tracking-widest uppercase'>{title}</h2>
          {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
        </div>

        {/* Team names + scores */}
        {/* Team names + scores */}
        <div className='col-span-3 grid grid-cols-3 items-center py-4'>
          <span className='text-base-content text-right text-base font-bold'>{homeTeam}</span>
          <div className='flex items-center justify-center gap-2'>
            <span
              className={`text-3xl font-black ${
                homeScore > awayScore ? 'text-primary' : 'text-base-content'
              }`}>
              {homeScore}
            </span>
            <span className='text-neutral text-base'>-</span>
            <span
              className={`text-3xl font-black ${
                awayScore > homeScore ? 'text-primary' : 'text-base-content'
              }`}>
              {awayScore}
            </span>
          </div>
          <span className='text-base-content text-left text-base font-bold'>{awayTeam}</span>
        </div>

        {/* Date / venue */}
        {(date || venue) && (
          <div className='text-neutral col-span-3 my-2 text-center text-xs'>
            {date}
            {date && venue ? ' · ' : ''}
            {venue}
          </div>
        )}

        {/* Scorers */}
        {scorers.length > 0 && (
          <>
            <ul className='flex flex-col items-end gap-1'>
              {homeScorers.map((s, i) => (
                <li key={i} className='text-base-content text-xs'>
                  {s.name} {s.minute}&apos;
                </li>
              ))}
            </ul>
            <span />
            <ul className='flex flex-col items-start gap-1'>
              {awayScorers.map((s, i) => (
                <li key={i} className='text-base-content text-xs'>
                  {s.name} {s.minute}&apos;
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Stats */}
        {stats.map((s, i) => (
          <div
            key={i}
            className='col-span-3 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-3'>
            <span className='text-base-content w-10 text-right text-xs font-semibold'>
              {s.home}
            </span>
            <div className='bg-neutral/20 h-1.5 overflow-hidden rounded-full'>
              <div className='bg-accent h-full rounded-full' style={{ width: '60%' }} />
            </div>
            <span className='text-neutral w-20 text-center text-xs'>{s.label}</span>
            <div className='bg-neutral/20 h-1.5 overflow-hidden rounded-full'>
              <div className='bg-primary h-full rounded-full' style={{ width: '40%' }} />
            </div>
            <span className='text-base-content w-10 text-left text-xs font-semibold'>{s.away}</span>
          </div>
        ))}

        {/* Footer */}
        <div className='col-span-3'>
          <Footer citation={citation} />
        </div>
      </div>
    </Background>
  );
};

Scorecard.displayName = 'Scorecard';
