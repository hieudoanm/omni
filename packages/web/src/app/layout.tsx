import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Omni',
  description: 'Omni',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en' className={`${orbitron.variable} h-full antialiased`}>
      <body className='flex min-h-full flex-col' style={{ fontFamily: 'var(--font-orbitron)' }}>
        {children}
      </body>
    </html>
  );
}
