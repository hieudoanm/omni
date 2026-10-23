import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Notification: FC<TemplateProps> = ({ data }) => {
  const app = (data.app as string) ?? '';
  const title = (data.title as string) ?? '';
  const body = (data.body as string) ?? '';
  const time = (data.time as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='bg-base-200 rounded-box w-full max-w-sm p-3 shadow-lg'>
        <div className='flex items-start gap-4'>
          <div className='bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'>
            <span className='text-primary-content text-base font-bold'>{(app || 'M')[0]}</span>
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between'>
              <span className='text-base-content text-xs font-bold'>{app || 'Messages'}</span>
              <time className='text-neutral text-xs'>{time || 'now'}</time>
            </div>
            <p className='text-base-content mt-0.5 text-base font-semibold'>
              {title || 'Alex Chen'}
            </p>
            <p className='text-neutral mt-0.5 truncate text-xs'>
              {body || 'Are we still on for tomorrow?'}
            </p>
          </div>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Notification.displayName = 'Notification';
