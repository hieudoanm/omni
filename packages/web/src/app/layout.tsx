import type { Metadata } from 'next';
import { DM_Mono, Orbitron } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Omni',
  description: 'Omni',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en' className={`${orbitron.variable} ${dmMono.variable} h-full antialiased`}>
      <body className='flex min-h-full flex-col'>{children}</body>
    </html>
  );
}
