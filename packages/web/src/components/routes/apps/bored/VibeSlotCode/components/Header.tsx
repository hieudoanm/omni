import { FC } from 'react';
import { PiSparkle } from 'react-icons/pi';

export const Header: FC = () => (
  <div className='flex flex-col items-center gap-2 text-center'>
    <div className='text-neutral flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase'>
      <PiSparkle className='h-3 w-3' />
      <span>Vibe Slot Code</span>
      <PiSparkle className='h-3 w-3' />
    </div>
    <p className='text-base-content/40 text-xs sm:text-sm'>
      Full-stack idea generator — spin to discover what to build
    </p>
  </div>
);
