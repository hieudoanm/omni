'use client';

import { Breadcrumb } from '@/components/organisms/layout/Breadcrumb';
import { LeftSidebar } from '@/components/organisms/layout/LeftSidebar';
import { RightSidebar } from '@/components/organisms/layout/RightSidebar';
import { SidebarProvider } from '@/components/organisms/layout/SidebarProvider';
import { useSWRegister } from '@/hooks/useSWRegister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode, useState } from 'react';

const LayoutContent: FC<{ children: ReactNode }> = ({ children = <></> }) => {
  return (
    <div className='bg-base-100 text-base-content flex h-screen w-screen overflow-hidden'>
      <LeftSidebar />
      <main className='border-base-300 flex h-screen flex-1 flex-col border-r border-l'>
        <div className='flex-1 overflow-y-auto'>{children}</div>
        <Breadcrumb />
      </main>
      <RightSidebar />
    </div>
  );
};

const RootLayoutClient: FC<{ children: ReactNode }> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  useSWRegister();

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </QueryClientProvider>
  );
};

export default RootLayoutClient;
