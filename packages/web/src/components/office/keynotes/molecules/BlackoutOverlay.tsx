'use client';

import { type FC } from 'react';

export type ScreenMode = 'normal' | 'black' | 'white';

export const BlackoutOverlay: FC<{ mode: ScreenMode }> = ({ mode }) => {
  if (mode === 'normal') return null;
  return (
    <div
      className={`absolute inset-0 z-40 ${mode === 'black' ? 'bg-black' : 'bg-white'}`}
      onClick={() => undefined}
    />
  );
};
