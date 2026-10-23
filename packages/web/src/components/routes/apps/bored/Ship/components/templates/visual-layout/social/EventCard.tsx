import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const EventCard: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const date = (data.date as string) ?? '';
  const location = (data.location as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='rounded-box border-accent/20 flex flex-1 flex-col border p-4 shadow-sm'>
        <div className='mb-3 inline-flex items-center gap-3'>
          <div className='bg-primary text-primary-content flex flex-col items-center justify-center px-2 py-1 text-center'>
            <span className='text-xs font-bold tracking-wider uppercase'>
              {date ? date.split(' ')[0] : 'JAN'}
            </span>
            <span className='text-xs leading-none font-black'>
              {date ? date.match(/\d+/)?.[0] : '15'}
            </span>
          </div>
          <div>
            <Header title={title} subtitle={subtitle} />
          </div>
        </div>
        {location && (
          <div className='text-neutral mt-auto flex items-center gap-2 text-xs'>
            <svg
              className='h-4 w-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
            {location}
          </div>
        )}
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

EventCard.displayName = 'EventCard';
