import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const Browser: FC<TemplateProps> = ({ data }) => {
  const url = (data.url as string) ?? '';
  const pageTitle = (data.pageTitle as string) ?? '';
  const title = (data.title as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const image = (data.image as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex w-full flex-col gap-2'>
        <Header title={title} subtitle={subtitle} />
        <div className='border-base-300 flex w-full flex-col overflow-hidden rounded-2xl border shadow-lg'>
          <div className='bg-base-200 border-base-300 flex flex-col border-b'>
            <div className='flex items-center gap-2 px-3 pt-2 pb-1'>
              <div className='flex gap-1'>
                <div className='h-2 w-2 rounded-full bg-red-500' />
                <div className='h-2 w-2 rounded-full bg-yellow-500' />
                <div className='h-2 w-2 rounded-full bg-green-500' />
              </div>
              {pageTitle && (
                <span className='text-neutral/50 text-xs font-medium'>{pageTitle}</span>
              )}
            </div>
            <div className='bg-base-100 mx-2 mb-1.5 flex items-center gap-1 rounded px-2 py-1 text-xs'>
              <span className='text-neutral/40'>https://</span>
              <span className='text-neutral font-medium'>{url}</span>
            </div>
          </div>
          {image ? (
            <div className='aspect-video w-full overflow-hidden'>
              <img src={image} alt='' className='h-full w-full object-cover' />
            </div>
          ) : (
            <></>
            // <div className="bg-base-200 flex aspect-video w-full items-center justify-center">
            //   <span className="text-neutral/30 text-xs font-semibold tracking-widest uppercase">
            //     Add image URL (16:9)
            //   </span>
            // </div>
          )}
        </div>
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

Browser.displayName = 'Browser';
