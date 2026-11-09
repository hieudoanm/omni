'use client';

import { type FC, type ReactNode } from 'react';
import { DeckProvider } from '@/components/office/keynotes/organisms/DeckProvider';
import { ToastProvider } from '@/components/office/keynotes/organisms/ToastProvider';
import { ToastContainer } from '@/components/office/keynotes/organisms/ToastContainer';

export const Providers = ({ children }: { children: ReactNode }) => (
  <ToastProvider>
    <DeckProvider>
      {children}
      <ToastContainer />
    </DeckProvider>
  </ToastProvider>
);
