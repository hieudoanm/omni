import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Story {
  title: string;
  summary: string;
}

export const DailyDigest: FC<TemplateProps> = ({ data }) => {
  const date = (data.date as string) ?? '';
  const stories = (data.stories as Story[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-4 text-center'>
        <h2 className='text-accent text-sm font-bold tracking-[0.2em] uppercase'>Daily Digest</h2>
        {date && <time className='text-base-content mt-2 block text-sm font-bold'>{date}</time>}
      </div>
      <ul className='flex flex-1 flex-col gap-4'>
        {stories.map((story, i) => (
          <li key={i} className='border-base-300 flex gap-3 rounded-2xl border p-3'>
            <span className='text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
              {i + 1}
            </span>
            <div className='min-w-0'>
              <h3 className='text-base-content text-sm leading-tight font-bold'>{story.title}</h3>
              <p className='text-neutral mt-2 text-sm leading-snug'>{story.summary}</p>
            </div>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

DailyDigest.displayName = 'DailyDigest';
