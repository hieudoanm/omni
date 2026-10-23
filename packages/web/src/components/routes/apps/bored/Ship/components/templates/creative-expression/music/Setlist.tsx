import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Setlist: FC<TemplateProps> = ({ data }) => {
  const artist = (data.artist as string) ?? 'Artist';
  const venue = (data.venue as string) ?? '';
  const date = (data.date as string) ?? '';
  const songs = (data.songs as { number: number; title: string; album: string }[]) ?? [];
  const encore = (data.encore as string[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Setlist</span>
      <h1 className='text-base-content mt-1 text-lg font-bold'>{artist}</h1>
      {venue && <p className='text-neutral text-xs'>{venue}</p>}
      {date && <time className='text-neutral text-xs'>{date}</time>}
      <ol className='mt-2 w-full max-w-xs space-y-1'>
        {songs.map((song, i) => (
          <li key={i} className='flex items-center gap-1'>
            <span className='text-neutral w-4 text-xs font-bold'>{song.number}</span>
            <span className='text-base-content flex-1 text-left text-xs font-medium'>
              {song.title}
            </span>
            {song.album && (
              <span className='bg-base-200 text-neutral rounded px-1 py-0.5 text-xs'>
                {song.album}
              </span>
            )}
          </li>
        ))}
      </ol>
      {encore.length > 0 && (
        <div className='mt-2 w-full max-w-xs'>
          <p className='text-accent text-xs font-bold uppercase'>Encore</p>
          <ul className='mt-1 space-y-1'>
            {encore.map((song, i) => (
              <li key={i} className='text-base-content text-left text-xs'>
                {song}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};
Setlist.displayName = 'Setlist';
