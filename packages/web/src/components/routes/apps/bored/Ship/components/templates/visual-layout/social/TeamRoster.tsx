import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Member {
  name: string;
  role: string;
  number?: number;
}

export const TeamRoster: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Team Roster';
  const members = (data.members as Member[]) ?? [
    { name: 'Alice', role: 'Captain', number: 10 },
    { name: 'Bob', role: 'Striker', number: 9 },
    { name: 'Carol', role: 'Defender', number: 4 },
    { name: 'Dave', role: 'Midfielder', number: 8 },
    { name: 'Eve', role: 'Goalkeeper', number: 1 },
    { name: 'Frank', role: 'Winger', number: 7 },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-base-content mb-4 text-center text-xs font-bold'>{title}</h2>
      <ul className='grid flex-1 grid-cols-3 gap-1'>
        {members.slice(0, 9).map((m, i) => (
          <li
            key={i}
            className='bg-accent/5 border-base-300 flex flex-col items-center gap-1 rounded border p-1'>
            <div className='bg-primary/20 flex h-4 w-4 items-center justify-center rounded-full'>
              <span className='text-primary text-xs font-bold'>{m.name.charAt(0)}</span>
            </div>
            <span className='text-base-content text-xs font-bold'>
              <strong>{m.name}</strong>
            </span>
            <span className='text-neutral text-xs'>{m.role}</span>
            {m.number != null && (
              <span className='text-primary text-xs font-bold'>#{m.number}</span>
            )}
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

TeamRoster.displayName = 'TeamRoster';
