import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Mention: FC<TemplateProps> = ({ data }) => {
  const handle = (data.handle as string) ?? '';
  const quote = (data.quote as string) ?? '';
  const name = (data.name as string) ?? '';
  const avatarUrl = (data.avatarUrl as string) ?? '';
  const likes = (data.likes as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='rounded-box border-accent/20 flex flex-1 flex-col border p-4'>
        <div className='mb-2 flex items-center gap-1'>
          {avatarUrl ? (
            <img src={avatarUrl} alt='' className='h-6 w-6 rounded-full object-cover' />
          ) : (
            <div className='bg-accent/10 flex h-6 w-6 items-center justify-center rounded-full'>
              <span className='text-accent text-xs font-bold'>@</span>
            </div>
          )}
          <div>
            <p className='text-base-content text-xs font-bold'>{name || 'username'}</p>
            <p className='text-neutral text-xs'>{handle || '@handle'}</p>
          </div>
          <svg className='text-primary ml-auto h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z' />
          </svg>
        </div>
        <div className='mb-2 flex-1'>
          <p className='text-base-content text-sm leading-relaxed'>
            {quote || 'Great content! Really insightful perspective on this topic.'}
          </p>
        </div>
        <div className='text-neutral flex items-center gap-4 text-xs'>
          <div className='flex items-center gap-1'>
            <svg
              className='h-4 w-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
              />
            </svg>
            {likes || '124'}
          </div>
          <div className='flex items-center gap-1'>
            <svg
              className='h-4 w-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
            Reply
          </div>
          <div className='flex items-center gap-1'>
            <svg
              className='h-4 w-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
              />
            </svg>
            Share
          </div>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Mention.displayName = 'Mention';
