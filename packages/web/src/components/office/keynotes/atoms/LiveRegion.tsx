'use client';

import { type FC } from 'react';

export const LiveRegion: FC<{ message: string }> = ({ message }) => (
  <div role='status' aria-live='polite' aria-atomic='true' className='sr-only'>
    {message}
  </div>
);
