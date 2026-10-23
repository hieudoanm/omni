import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface TimelineEntry {
  date: string;
  event: string;
}

export const Timeline: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const entries = (data.entries as TimelineEntry[]) ?? [];
  const imageUrl = (data.imageUrl as string) ?? '';
  const items =
    entries.length > 0
      ? entries
      : ([
          { date: 'Q1 2024', event: 'Research phase' },
          { date: 'Q2 2024', event: 'MVP development' },
          { date: 'Q3 2024', event: 'Beta launch' },
          { date: 'Q4 2024', event: 'Public release' },
        ] as TimelineEntry[]);

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex flex-col gap-y-4'>
        <Header title={title} />
        <div className='relative flex flex-1 flex-col gap-0'>
          <div className='bg-base-300 absolute top-2 bottom-2 left-[5px] w-0.5' />
          {items.map((entry, i) => (
            <div
              key={`${entry.date}-${entry.event}`}
              className='relative flex flex-1 items-start gap-3 text-left'>
              <div className='relative z-10 mt-1 flex-shrink-0'>
                <div
                  className={`h-3 w-3 rounded-full ${
                    i === 0 ? 'bg-primary ring-primary/20 ring-2' : 'bg-base-300'
                  }`}
                />
              </div>
              <div className='flex flex-1 flex-col gap-0.5 pb-2'>
                <time className='text-primary text-xs font-semibold tracking-wider uppercase'>
                  {entry.date}
                </time>
                <span className='text-base-content text-sm leading-snug'>{entry.event}</span>
              </div>
            </div>
          ))}
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt=''
            className='rounded-box mt-2 h-24 w-full flex-shrink-0 object-cover'
          />
        )}
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

Timeline.displayName = 'Timeline';
