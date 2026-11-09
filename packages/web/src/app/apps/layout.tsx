import RootLayoutClient from '@/components/layout/RootLayoutClient';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Omni Apps',
  description: 'Developer tools, calculators, clocks and utilities.',
};

const AppsLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div data-theme='omni' className='font-mono'>
      <RootLayoutClient>{children}</RootLayoutClient>
    </div>
  );
};

export default AppsLayout;
