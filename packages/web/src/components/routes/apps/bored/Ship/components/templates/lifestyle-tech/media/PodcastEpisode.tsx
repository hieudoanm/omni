import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const PodcastEpisode: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Untitled Episode';
  const episode = (data.episode as string) ?? '01';
  const guest = (data.guest as string) ?? 'Unknown Guest';
  const duration = (data.duration as string) ?? '00:00';
  const subtitle = (data.subtitle as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-4 text-center'>
        <div className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Podcast</div>
      </div>
      <div className='bg-primary text-base-100 mb-5 flex h-24 w-24 items-center justify-center rounded-full'>
        <span className='text-lg'>&#9654;</span>
      </div>
      <Header title={title} subtitle={subtitle} />
      <Footer citation={citation} />
    </Background>
  );
};

PodcastEpisode.displayName = 'PodcastEpisode';
