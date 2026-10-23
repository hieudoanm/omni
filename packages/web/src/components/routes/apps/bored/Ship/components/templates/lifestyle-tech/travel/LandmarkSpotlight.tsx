import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const LandmarkSpotlight: FC<TemplateProps> = ({ data }) => {
  const name = (data.name as string) ?? '';
  const location = (data.location as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const funFact = (data.funFact as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Landmark</span>
      <h1 className='text-base-content mt-1 text-4xl font-bold'>{name}</h1>
      {location && <p className='text-neutral mt-1 text-xs'>{location}</p>}
      <p className='text-base-content mt-5 text-sm leading-relaxed'>{subtitle}</p>
      {funFact && (
        <div className='bg-accent/5 rounded-box mt-6 px-4 py-3'>
          <span className='text-accent text-xs font-bold tracking-widest uppercase'>
            Did You Know?
          </span>
          <p className='text-base-content mt-1 text-xs leading-relaxed'>{funFact}</p>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

LandmarkSpotlight.displayName = 'LandmarkSpotlight';
