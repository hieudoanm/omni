import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const ProfileCard: FC<TemplateProps> = ({ data }) => {
  const name = (data.name as string) ?? '';
  const titleText = (data.title as string) ?? '';
  const bio = (data.bio as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=''
          className='ring-accent/20 mb-3 h-14 w-14 rounded-full object-cover ring-4'
        />
      ) : (
        <div className='bg-accent/10 ring-accent/20 mb-3 flex h-14 w-14 items-center justify-center rounded-full ring-4'>
          <span className='text-accent text-xl font-bold'>{name.charAt(0) || '?'}</span>
        </div>
      )}
      <h1 className='text-base-content mb-1 text-4xl font-bold tracking-tight'>{name}</h1>
      <p className='text-primary mb-3 text-xs font-semibold tracking-widest uppercase'>
        {titleText}
      </p>
      <p className='text-neutral mx-auto max-w-sm text-sm leading-relaxed'>{bio}</p>
      <Footer citation={citation} />
    </Background>
  );
};

ProfileCard.displayName = 'ProfileCard';
