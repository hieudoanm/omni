import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const ChallengeCard: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const days = (data.days as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-sm font-bold tracking-[0.2em] uppercase'>Challenge</span>
      <Header title={title} subtitle={subtitle} />
      {days && (
        <div className='rounded-box bg-accent/10 px-6 py-4'>
          <span className='text-accent text-sm font-bold'>{days} Day Challenge</span>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

ChallengeCard.displayName = 'ChallengeCard';
