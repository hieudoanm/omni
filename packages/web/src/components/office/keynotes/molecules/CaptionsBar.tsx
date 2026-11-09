'use client';

import { type FC } from 'react';

export const CaptionsBar: FC<{ text: string; listening: boolean }> = ({ text, listening }) => {
  if (!listening && !text) return null;
  return (
    <div className='pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center p-4'>
      <div className='max-w-[80%] rounded-2xl bg-black/80 px-5 py-3 text-center text-lg text-white shadow-2xl'>
        {text || <span className='text-sm opacity-60'>Listening… speak to caption your talk.</span>}
      </div>
    </div>
  );
};
