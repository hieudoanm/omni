import { Header } from '@/components/office/shared/organisms/Header';
import { mono, sans, serif } from '@/lib/office/calendar/fonts';
import '@/styles/office/global.css';
import '@/styles/office/keynotes-animations.css';
import '@/styles/office/keynotes-utilities.css';
import type { FC, ReactNode } from 'react';

const OfficeLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <div
    id='office-root'
    data-theme='office-light'
    className={`${sans.variable} ${mono.variable} ${serif.variable} bg-base-100 text-base-content flex h-full w-full flex-1 flex-col font-mono`}>
    <Header />
    <div className='flex-1 overflow-y-auto'>{children}</div>
  </div>
);

export default OfficeLayout;
