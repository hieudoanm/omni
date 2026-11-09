import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const ChordChart: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Chord Chart';
  const chords = (data.chords as { name: string; fingers: string }[]) ?? [];
  const difficulty = (data.difficulty as string) ?? '';
  const tip = (data.tip as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Chord Chart</span>
      <h1 className='text-base-content mt-0.5 text-lg font-bold'>{title}</h1>
      {difficulty && (
        <span className='bg-secondary/10 text-secondary mt-0.5 rounded-full px-3 py-0.5 text-xs font-bold'>
          {difficulty}
        </span>
      )}
      <ul className='mt-3 grid grid-cols-3 gap-2'>
        {chords.map((chord, i) => (
          <li key={i} className='flex flex-col items-center'>
            <div className='bg-base-200 border-base-300 flex h-8 w-7 flex-col items-center justify-center rounded-lg border'>
              <span className='text-base-content text-xs font-bold'>{chord.name}</span>
            </div>
            <p className='text-neutral mt-0.5 text-xs leading-tight'>{chord.fingers}</p>
          </li>
        ))}
      </ul>
      {tip && (
        <div className='bg-accent/10 text-accent mt-3 max-w-xs rounded-lg px-2 py-1 text-xs'>
          💡 {tip}
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};
ChordChart.displayName = 'ChordChart';
