import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const ShareCTA: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';
  const buttonLabel = (data.buttonLabel as string) ?? '';
  const hashtag = (data.hashtag as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex flex-col gap-4'>
        <Header title={title || 'Share This'} />
        <p className='text-neutral mb-4 max-w-sm text-sm leading-relaxed'>
          {text || 'Help others discover this content by sharing it with your network.'}
        </p>
        <div className='rounded-box bg-primary text-primary-content mx-auto w-fit px-4 py-1 text-xs font-bold tracking-wider uppercase'>
          {buttonLabel || 'Share Now'}
        </div>
        {hashtag && <p className='text-neutral mt-2 text-xs'>{hashtag}</p>}
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

ShareCTA.displayName = 'ShareCTA';
