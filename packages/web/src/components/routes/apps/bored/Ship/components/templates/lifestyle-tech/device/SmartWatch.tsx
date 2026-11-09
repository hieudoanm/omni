import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const SmartWatch: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const image = (data.image as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex w-full flex-col gap-2'>
        <Header title={title} subtitle={subtitle} />
      </div>
      <div className='ring-accent/30 flex flex-col items-center rounded-full p-3 ring-4'>
        {image ? (
          <div className='h-20 w-20 overflow-hidden rounded-full'>
            <img src={image} alt='' className='h-full w-full object-cover' />
          </div>
        ) : (
          <div className='bg-base-200 flex h-20 w-20 items-center justify-center rounded-full'>
            <span className='text-neutral/30 text-xs leading-tight font-semibold tracking-widest uppercase'>
              Add image (1:1)
            </span>
          </div>
        )}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

SmartWatch.displayName = 'SmartWatch';
