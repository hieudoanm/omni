import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const AlbumReview: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Untitled Album';
  const artist = (data.artist as string) ?? 'Unknown Artist';
  const genre = (data.genre as string) ?? '';
  const rating = (data.rating as number) ?? 0;
  const review = (data.review as string) ?? '';
  const favoriteTrack = (data.favoriteTrack as string) ?? '';

  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='bg-base-200 mb-2 flex h-10 w-10 items-center justify-center rounded-full text-xs'>
        🎵
      </div>
      <h1 className='text-base-content text-lg font-bold'>{title}</h1>
      <p className='text-neutral mt-1 text-xs'>{artist}</p>
      {genre && (
        <span className='bg-accent/10 text-accent mt-1 rounded-full px-1.5 py-0.5 text-xs font-bold'>
          {genre}
        </span>
      )}
      <ul className='mt-1.5 flex gap-2'>
        {stars.map((filled, i) => (
          <li key={i} className={filled ? 'text-primary text-xs' : 'text-base-300 text-xs'}>
            ★
          </li>
        ))}
      </ul>
      <blockquote className='text-neutral mt-2 max-w-xs text-xs leading-relaxed'>
        &ldquo;{review}&rdquo;
      </blockquote>
      {favoriteTrack && (
        <p className='text-base-content mt-1.5 text-xs'>
          <span className='text-neutral'>Favorite: </span>
          <strong className='font-bold'>{favoriteTrack}</strong>
        </p>
      )}
      <Footer citation={citation} />
    </Background>
  );
};
AlbumReview.displayName = 'AlbumReview';
