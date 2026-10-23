import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Stat {
  label: string;
  valueA: string;
  valueB: string;
}

export const HeadToHead: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Head to Head';
  const text = (data.text as string) ?? '';
  const teamA = (data.teamA as string) ?? 'Team A';
  const teamB = (data.teamB as string) ?? 'Team B';
  const formA = (data.formA as string) ?? 'W W D L W';
  const formB = (data.formB as string) ?? 'L W W W D';
  const stats = (data.stats as Stat[]) ?? [
    { label: 'League Position', valueA: '1st', valueB: '3rd' },
    { label: 'Goals Scored', valueA: '28', valueB: '22' },
    { label: 'Goals Conceded', valueA: '10', valueB: '15' },
    { label: 'Clean Sheets', valueA: '6', valueB: '4' },
  ];

  const citation = (data.citation as string) ?? '';

  const renderForm = (form: string) =>
    form.split(' ').map((r, i) => {
      const bg = r === 'W' ? 'bg-success' : r === 'D' ? 'bg-warning' : 'bg-error';
      return (
        <span
          key={i}
          className={`${bg} flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white`}>
          {r}
        </span>
      );
    });

  return (
    <Background>
      <div className='mb-4 text-center'>
        <h2 className='text-neutral text-xs font-semibold tracking-widest uppercase'>{title}</h2>
        {text && <p className='text-neutral mt-1 text-xs'>{text}</p>}
      </div>

      <div className='flex items-center justify-center gap-8 py-3'>
        <span className='text-base-content flex-1 text-right text-lg font-black'>{teamA}</span>
        <span className='text-accent text-base font-bold'>VS</span>
        <span className='text-base-content flex-1 text-left text-lg font-black'>{teamB}</span>
      </div>

      <div className='flex justify-center gap-8 py-2'>
        <div className='flex gap-1'>{renderForm(formA)}</div>
        <div className='flex gap-1'>{renderForm(formB)}</div>
      </div>

      <ul className='flex flex-1 flex-col justify-center gap-3 py-4'>
        {stats.map((s, i) => (
          <li key={i} className='flex items-center gap-3'>
            <span className='text-base-content w-12 text-right text-xs font-bold'>{s.valueA}</span>
            <div className='bg-accent/30 h-1.5 flex-1 rounded-full'>
              <div className='bg-accent h-full rounded-full' style={{ width: '55%' }} />
            </div>
            <span className='text-neutral w-28 text-center text-xs'>{s.label}</span>
            <div className='bg-primary/30 h-1.5 flex-1 rounded-full'>
              <div className='bg-primary h-full rounded-full' style={{ width: '45%' }} />
            </div>
            <span className='text-base-content w-12 text-left text-xs font-bold'>{s.valueB}</span>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

HeadToHead.displayName = 'HeadToHead';
