import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Fixture {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
}

export const MatchSchedule: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Match Schedule';
  const text = (data.text as string) ?? '';
  const fixtures = (data.fixtures as Fixture[]) ?? [
    {
      date: 'Sat 15 Mar',
      time: '15:00',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      venue: 'Emirates Stadium',
    },
    {
      date: 'Sat 15 Mar',
      time: '17:30',
      homeTeam: 'Liverpool',
      awayTeam: 'Man City',
      venue: 'Anfield',
    },
    {
      date: 'Sun 16 Mar',
      time: '14:00',
      homeTeam: 'Tottenham',
      awayTeam: 'Man United',
      venue: 'Tottenham Hotspur Stadium',
    },
    {
      date: 'Sun 16 Mar',
      time: '16:30',
      homeTeam: 'Newcastle',
      awayTeam: 'Brighton',
      venue: "St James' Park",
    },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-5 text-center'>
        <h2 className='text-base-content text-base font-bold'>{title}</h2>
        {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
      </div>

      <ul className='flex flex-1 flex-col gap-3'>
        {fixtures.map((f, i) => (
          <li key={i} className='border-base-300 rounded-box border px-4 py-3'>
            <div className='mb-2 flex items-center justify-between'>
              <time className='text-accent text-xs font-bold'>{f.date}</time>
              <span className='text-neutral text-xs'>{f.time}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-base-content flex-1 text-base font-semibold'>{f.homeTeam}</span>
              <span className='text-neutral text-xs'>vs</span>
              <span className='text-base-content flex-1 text-right text-base font-semibold'>
                {f.awayTeam}
              </span>
            </div>
            <div className='text-neutral mt-2 text-center text-xs'>{f.venue}</div>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

MatchSchedule.displayName = 'MatchSchedule';
