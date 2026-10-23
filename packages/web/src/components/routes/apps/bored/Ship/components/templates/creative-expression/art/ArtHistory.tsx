import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface HistoryEntry {
  date: string;
  event: string;
  artist: string;
}

export const ArtHistory: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Art History';
  const period = (data.period as string) ?? '';
  const entries = (data.entries as HistoryEntry[]) ?? [
    { date: '1485', event: 'Mona Lisa painted', artist: 'Leonardo da Vinci' },
    { date: '1512', event: 'Sistine Chapel ceiling', artist: 'Michelangelo' },
    { date: '1889', event: 'Starry Night created', artist: 'Vincent van Gogh' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-0.5 text-4xl font-black tracking-tight'>{title}</h1>
      {period && <p className='text-primary mb-3 text-xs font-semibold'>{period}</p>}
      <ol className='relative flex w-full flex-col gap-2 pl-3'>
        <div className='bg-primary/20 absolute top-2 left-[7px] h-[calc(100%-16px)] w-0.5' />
        {entries.map((e, i) => (
          <li key={i} className='relative flex items-start gap-2'>
            <div className='bg-primary absolute top-1.5 -left-6 h-3 w-3 rounded-full ring-2 ring-white' />
            <div className='text-left'>
              <time className='text-primary text-xs font-bold tracking-wider uppercase'>
                {e.date}
              </time>
              <p className='text-base-content text-xs leading-snug font-medium'>{e.event}</p>
              <p className='text-neutral text-xs italic'>{e.artist}</p>
            </div>
          </li>
        ))}
      </ol>
      <Footer citation={citation} />
    </Background>
  );
};

ArtHistory.displayName = 'ArtHistory';
