'use client';

import { type FC, type ReactNode } from 'react';
import { Providers } from '@/components/office/keynotes/Providers';

const KeynotesLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <Providers>{children}</Providers>
);

export default KeynotesLayout;
