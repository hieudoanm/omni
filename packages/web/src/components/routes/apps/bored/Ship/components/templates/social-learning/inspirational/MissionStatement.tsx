import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const MissionStatement: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const mission = (data.mission as string) ?? '';
  const vision = (data.vision as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div>
        <h2 className='text-accent text-sm font-bold tracking-[0.2em] uppercase'>{title}</h2>
        <p className='text-base-content mt-4 text-4xl leading-snug font-bold'>{mission}</p>
      </div>
      {vision && (
        <div className='border-accent/20 border-t pt-6'>
          <h3 className='text-neutral/60 text-sm font-bold tracking-[0.2em] uppercase'>Vision</h3>
          <p className='text-neutral mt-2 text-sm leading-relaxed'>{vision}</p>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

MissionStatement.displayName = 'MissionStatement';
