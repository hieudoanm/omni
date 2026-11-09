import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const Mobile: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const image = (data.image as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex w-full flex-col gap-2'>
        <Header title={title} subtitle={subtitle} />
      </div>
      <div className='ring-base-300 flex w-36 flex-col items-center rounded-[2.5rem] ring-4'>
        <div className='bg-base-200 mt-2 h-5 w-20 rounded-full' />
        {image ? (
          <div className='flex w-full flex-1 flex-col overflow-hidden rounded-[2rem] px-1 pb-1'>
            <div className='aspect-[9/16] w-full overflow-hidden rounded-2xl'>
              <img src={image} alt='' className='h-full w-full object-cover' />
            </div>
          </div>
        ) : (
          <div className='flex w-full flex-1 flex-col px-2 pb-1'>
            <div className='bg-base-200 flex aspect-[9/16] w-full items-center justify-center rounded-2xl'>
              <span className='text-neutral/30 text-xs font-semibold tracking-widest uppercase'>
                Add image URL (9:16)
              </span>
            </div>
          </div>
        )}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Mobile.displayName = 'Mobile';
