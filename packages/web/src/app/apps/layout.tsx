import RootLayoutClient from '@/components/layout/RootLayoutClient';
import { Be_Vietnam_Pro } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  title: 'Omni Apps',
  description: 'Developer tools, calculators, clocks and utilities.',
};

const AppsLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div data-theme='nothing' className={beVietnamPro.className}>
      <RootLayoutClient>{children}</RootLayoutClient>
    </div>
  );
};

export default AppsLayout;
