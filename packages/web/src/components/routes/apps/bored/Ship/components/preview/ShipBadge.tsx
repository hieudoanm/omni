import type { FC } from 'react';

export const ShipBadge: FC<{
  username: string;
}> = ({ username }) => (
  <div className='pointer-events-none absolute right-4 bottom-4 rounded-lg bg-black/30 px-3 py-1.5 text-xs leading-tight text-white/80 backdrop-blur-sm'>
    @{username}
  </div>
);
