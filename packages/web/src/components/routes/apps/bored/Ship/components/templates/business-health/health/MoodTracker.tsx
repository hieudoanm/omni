import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

const MOOD_EMOJIS: Record<string, string> = {
  great: '😄',
  good: '🙂',
  okay: '😐',
  low: '😔',
  bad: '😢',
};

export const MoodTracker: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const mood = (data.mood as string) ?? '';
  const note = (data.note as string) ?? '';
  const date = (data.date as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase'>
        {title || 'Mood Tracker'}
      </span>
      {date && <time className='text-neutral mb-6 text-xs'>{date}</time>}
      <span className='text-3xl'>{MOOD_EMOJIS[mood] ?? '😐'}</span>
      <p className='text-base-content mt-4 text-lg font-semibold capitalize'>{mood || 'Okay'}</p>
      {note && <p className='text-neutral mt-4 text-sm leading-relaxed'>{note}</p>}
      <Footer citation={citation} />
    </Background>
  );
};

MoodTracker.displayName = 'MoodTracker';
