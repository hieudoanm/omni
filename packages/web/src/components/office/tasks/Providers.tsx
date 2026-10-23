'use client';

import type { FC, ReactNode } from 'react';
import { DataProvider } from '@/lib/office/tasks/data-provider';
import { AuthProvider } from '@/lib/office/tasks/auth';
import { ToastProvider } from '@/lib/office/tasks/toast';

export const TasksProviders = ({ children }: { children: ReactNode }) => (
  <DataProvider>
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  </DataProvider>
);
